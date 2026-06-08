import css from './portfolio-visualizer.module.css'
import cx from '@course/cx'
import styles from '@course/styles'
import { useEffect, useRef, useState } from 'react'

export type TPortfolioNode = {
    id: string
    name: string
    value: number
    children?: TPortfolioNode[]
}

type TPortfolioVisualizerProps = {
    data: TPortfolioNode
}

type TPortfolioStateNode = Omit<TPortfolioNode, 'children'> & {
    parentID: string | null
    children?: string[]
}

function process(data: TPortfolioNode) {
    const store = new Map<string, TPortfolioStateNode>();
    function walk(node: TPortfolioNode, parentID: string | null) {
        store.set(node.id, {
            parentID,
            id: node.id,
            value: node.value,
            name: node.name,
            children: (node.children ?? []).map(ch => ch.id),
        });
        for (const child of node.children ?? []) {
            walk(child, node.id);
        }
    }
    walk(data, null);
    return store;
}

type TStoreState = {
    store: Map<string, TPortfolioStateNode>
    revision: number
}

function sumLeaves(store: Map<string, TPortfolioStateNode>, id: string): number {
    const node = store.get(id)!;
    const children = node.children ?? [];
    if (children.length === 0) return node.value;
    return children.reduce((sum, childId) => sum + sumLeaves(store, childId), 0);
}

function sumDirectChildren(store: Map<string, TPortfolioStateNode>, id: string): number {
    const node = store.get(id)!;
    return (node.children ?? []).reduce(
        (sum, childId) => sum + (store.get(childId)?.value ?? 0),
        0,
    );
}

function portfolioTotal(store: Map<string, TPortfolioStateNode>, rootId: string): number {
    return sumDirectChildren(store, rootId);
}

function nodePercentValue(
    store: Map<string, TPortfolioStateNode>,
    id: string,
): number {
    const node = store.get(id)!;
    const children = node.children ?? [];
    return children.length > 0 ? sumLeaves(store, id) : node.value;
}

function syncRootTotal(
    store: Map<string, TPortfolioStateNode>,
    rootId: string,
): Map<string, TPortfolioStateNode> {
    const root = store.get(rootId)!;
    const total = portfolioTotal(store, rootId);
    if (root.value === total) return store;
    const next = new Map(store);
    next.set(rootId, { ...root, value: total });
    return next;
}

function tryUpdateNode(
    store: Map<string, TPortfolioStateNode>,
    target: HTMLInputElement,
    rootId: string,
): Map<string, TPortfolioStateNode> | null {
    const nodeId = target.dataset.nodeId ?? '';
    if (!store.has(nodeId)) return null;
    if (nodeId === rootId) {
        target.value = `${portfolioTotal(store, rootId)}`;
        return null;
    }

    const node = store.get(nodeId)!;
    const childrenSum = (node.children ?? []).reduce(
        (sum, id) => sum + (store.get(id)?.value ?? 0),
        0,
    );
    const value = +target.value;

    if (Number.isNaN(value) || childrenSum > value) {
        target.value = `${node.value}`;
        return null;
    }

    if (node.parentID) {
        const parent = store.get(node.parentID)!;
        const siblingsSum = (parent.children ?? []).reduce(
            (acc, id) => acc + (id === nodeId ? 0 : (store.get(id)?.value ?? 0)),
            0,
        );
        if (value > parent.value - siblingsSum) {
            target.value = `${node.value}`;
            return null;
        }
    }

    if (value === node.value) return null;

    const newStore = new Map(store);
    newStore.set(nodeId, { ...node, value });
    return syncRootTotal(newStore, rootId);
}

type TPortfolioNodeProps = {
    id: string
    store: Map<string, TPortfolioStateNode>
    total: number
    revision: number
    isRoot?: boolean
}

function PortfolioNode({ id, store, total, revision, isRoot = false }: TPortfolioNodeProps) {
    const node = store.get(id)!;
    const { value, children = [], name } = node;
    const displayValue = isRoot ? total : value;
    const percentValue = isRoot ? sumLeaves(store, id) : nodePercentValue(store, id);
    const percentage = total > 0 ? ((percentValue / total) * 100).toFixed(2) : '0.00';

    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = `${displayValue}`;
        }
    }, [displayValue]);

    const childrenSum = children.reduce(
        (sum, childId) => sum + (store.get(childId)?.value ?? 0),
        0,
    );
    const unallocated = value - childrenSum;

    return (
        <details className={cx(styles.paddingLeft16, styles.paddingVer8, css.details)} open>
            <summary className={styles.flexRowBetween}>
                <div className={cx(styles.flexRowBetween, styles.flexRowGap16, styles.wh100)}>
                    <label htmlFor={id}><strong>{name}</strong></label>
                    <div className={cx(styles.flexRowGap8, styles.flexRowBetween)}>
                        <input
                            ref={inputRef}
                            data-node-id={id}
                            id={id}
                            type="text"
                            defaultValue={displayValue}
                            readOnly={isRoot}
                        />
                        <span className={styles.w100px}>{percentage}%</span>
                    </div>
                </div>
            </summary>
            {children.length > 0 &&
                children.map((childId) => (
                    <PortfolioNode
                        key={childId}
                        id={childId}
                        store={store}
                        total={total}
                        revision={revision}
                    />
                ))}
            {children.length > 0 && unallocated > 0 && (
                <p><strong>Unallocated cash: </strong>{unallocated}</p>
            )}
        </details>
    );
}

export function PortfolioVisualizer({ data }: TPortfolioVisualizerProps) {
    const [{ store, revision }, setState] = useState<TStoreState>(() => ({
        store: syncRootTotal(process(data), data.id),
        revision: 0,
    }));

    const commitInput = (target: HTMLInputElement) => {
        setState(({ store: current, revision }) => {
            const nextStore = tryUpdateNode(current, target, data.id);
            if (!nextStore) return { store: current, revision };
            return { store: nextStore, revision: revision + 1 };
        });
    };

    const onNodeUpdate: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
        if (e.key !== 'Enter' && e.key !== 'NumpadEnter') return;
        if (!(e.target instanceof HTMLInputElement)) return;
        e.preventDefault();
        commitInput(e.target);
    };

    const onNodeBlur: React.FocusEventHandler<HTMLDivElement> = (e) => {
        if (!(e.target instanceof HTMLInputElement)) return;
        commitInput(e.target);
    };

    const total = portfolioTotal(store, data.id);

    return (
        <div
            onKeyDown={onNodeUpdate}
            onBlur={onNodeBlur}
            className={cx(styles.w600px, styles.b4, styles.bgBlack1, styles.padding16)}
        >
            <PortfolioNode
                key={revision}
                id={data.id}
                store={store}
                total={total}
                revision={revision}
                isRoot
            />
        </div>
    );
}
