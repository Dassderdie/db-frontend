import type { ForeignAttribute } from '@cache-server/api/tables/attribute';
import type { DefaultTable, Table } from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import type { Version } from '@cache-server/api/versions/version';
import type { MessageService } from '@core/utility/messages/message.service';
import { getForeignEntryAttributeIds } from '@shared/utility/functions/get-foreign-entry-attribute-ids';
import { getForeignEntryId } from '@shared/utility/functions/get-foreign-entry-id';
import { presentForeignRelationsFilter } from '@shared/versions/display-version/foreign/present-foreign-relations-filter';
import type { Observable } from 'rxjs';
import { firstValueFrom, BehaviorSubject, Subject } from 'rxjs';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export class RelationExplorer {
    private readonly destroyed = new Subject();

    public nodes: ReadonlyArray<RelationNode> = [];
    public edges: ReadonlyArray<RelationEdge> = [];
    public nodes$ = new BehaviorSubject(this.nodes);
    public edges$ = new BehaviorSubject(this.edges);

    constructor(
        private readonly messageServices: MessageService,
        private readonly getVersions: (
            tableId: UUID,
            filter: string
        ) => Observable<{
            versions: ReadonlyArray<Version>;
            totalVersionCount: number;
        }>,
        private readonly getNewestVersion: (
            tableId: UUID,
            entryId: UUID
        ) => Observable<Version | undefined>,
        private readonly tables: ReadonlyArray<Table>,
        private readonly initialEntry: {
            tableId: UUID;
            entryId: UUID;
        }
    ) {
        this.reset();
    }

    public async expandNode(
        node: RelationNode,
        allowedAttributeIds: { [attributeId: string]: boolean }
    ) {
        errors.assert(!!node.version);
        this.updateNode(node.entryId, { status: 'expanding' });
        const foreignAttributes = this.getTable(node.tableId).attributes.filter(
            (attribute) =>
                attribute.kind === 'foreign' &&
                allowedAttributeIds[attribute.id]
        ) as ReadonlyArray<ForeignAttribute>;
        const actions: Promise<unknown>[] = [];
        for (const foreignAttribute of foreignAttributes) {
            node.expandedAttributeIds.add(foreignAttribute.id);
            const intermediateTable = this.getTable(
                foreignAttribute.kindOptions.intermediateTableId
            );
            errors.assert(intermediateTable.type === 'intermediate');
            actions.push(
                (
                    firstValueFrom(
                        this.getVersions(
                            foreignAttribute.kindOptions.intermediateTableId,
                            JSON.stringify(
                                presentForeignRelationsFilter(
                                    getForeignEntryAttributeIds(
                                        intermediateTable,
                                        node.version.tableId,
                                        foreignAttribute.id
                                    ).entryAttributeId,
                                    node.version
                                )
                            )
                        )
                        // eslint-disable-next-line @typescript-eslint/no-loop-func
                    ) as Promise<{
                        versions: readonly Version[];
                        totalVersionCount: number;
                    }>
                ).then(({ versions, totalVersionCount }) => {
                    if (totalVersionCount > versions.length) {
                        this.messageServices.postMessage({
                            color: 'warning',
                            title: _(
                                'pages.relations-explorer.not-all-versions-shown-message.title'
                            ),
                            body: _(
                                'pages.relations-explorer.not-all-versions-shown-message.body'
                            ),
                        });
                    }
                    for (const intermediateVersion of versions) {
                        const foreignEntryId = getForeignEntryId(
                            intermediateVersion.values,
                            true,
                            intermediateTable,
                            node.tableId,
                            foreignAttribute.id
                        );
                        this.addNode(
                            foreignAttribute.kindOptions.foreign.tableId,
                            foreignEntryId
                        ).then(() =>
                            this.addEdge(
                                node.entryId,
                                foreignEntryId,
                                intermediateVersion
                            )
                        );
                    }
                })
            );
        }
        await Promise.all(actions);
        this.updateNode(node.entryId, { status: 'expanded' });
    }

    public removeNode(nodeToRemove: RelationNode) {
        const toBeRemovedEdges = this.edges.filter(
            (edge) =>
                edge.sourceEntryId === nodeToRemove.entryId ||
                edge.targetEntryId === nodeToRemove.entryId
        );
        // Remove the foreignAttribute from the corresponding expandedAttributeIds
        for (const edge of toBeRemovedEdges) {
            const intermediateTable = this.getTable(
                edge.intermediateVersion.tableId
            );
            errors.assert(intermediateTable.type === 'intermediate');
            const foreignNode = this.nodes.find(
                (node) =>
                    (node.entryId === edge.sourceEntryId ||
                        node.entryId === edge.targetEntryId) &&
                    node.entryId !== nodeToRemove.entryId
            );
            const { attributeId: foreignAttributeId, tableId: foreignTableId } =
                intermediateTable.intermediateTableInformation.first.tableId ===
                nodeToRemove.tableId
                    ? intermediateTable.intermediateTableInformation.second
                    : intermediateTable.intermediateTableInformation.first;
            errors.assert(foreignNode?.tableId === foreignTableId);
            const foreignTable = this.getTable(foreignTableId);
            errors.assert(!!foreignTable);
            foreignNode.expandedAttributeIds.delete(foreignAttributeId);
        }

        // Remove all Edges that have this node as a target or source
        this.updateEdges(
            this.edges.filter((edge) => !toBeRemovedEdges.includes(edge))
            // TODO: remove all removed attributes from the expandedAttributesSets
        );
        // Remove all entries that don't have any edges associated with them
        this.updateNodes(
            this.nodes.filter((node) =>
                this.edges.some(
                    (edge) =>
                        edge.sourceEntryId === node.entryId ||
                        edge.targetEntryId === node.entryId
                )
            )
        );
    }

    public reset() {
        this.updateNodes([]);
        this.updateEdges([]);
        this.addNode(this.initialEntry.tableId, this.initialEntry.entryId).then(
            (node) => {
                errors.assert(!!node);
                this.expandNode(node, {});
            }
        );
    }

    private async addNode(
        tableId: UUID,
        entryId: UUID
    ): Promise<RelationNode | undefined> {
        const presentNode = this.nodes.find((node) => node.entryId === entryId);
        if (presentNode) {
            return presentNode.version
                ? presentNode
                : // wait until it is fully loaded
                  presentNode.version$.then(() =>
                      this.nodes.find((node) => node.entryId === entryId)
                  );
        }
        const newNode: RelationNode = {
            tableId,
            entryId,
            table: this.getTable(tableId),
            version$: firstValueFrom(
                this.getNewestVersion(tableId, entryId)
            ) as Promise<Version>,
            status: 'collapsed',
            expandedAttributeIds: new Set(),
        };

        this.nodes = [...this.nodes, newNode];
        const version = await newNode.version$;
        return this.updateNode(entryId, { version });
    }

    private updateNode(
        entryId: UUID,
        changes: Partial<RelationNode>
    ): RelationNode {
        const nodeToUpdate = this.nodes.find(
            (node) => node.entryId === entryId
        );
        errors.assert(!!nodeToUpdate);
        const updatedNode = { ...nodeToUpdate, ...changes };
        this.updateNodes([
            ...this.nodes.filter((node) => node.entryId !== entryId),
            updatedNode,
        ]);
        return updatedNode;
    }

    private updateNodes(newNodes: ReadonlyArray<RelationNode>) {
        this.nodes = newNodes;
        this.nodes$.next(this.nodes);
    }
    private updateEdges(newEdges: ReadonlyArray<RelationEdge>) {
        this.edges = newEdges;
        this.edges$.next(this.edges);
    }

    private addEdge(
        sourceEntryId: UUID,
        targetEntryId: UUID,
        intermediateVersion: Version
    ) {
        errors.assert(
            this.nodes.some(
                (node) => node.entryId === sourceEntryId && !!node.version
            ) &&
                this.nodes.some(
                    (node) => node.entryId === targetEntryId && !!node.version
                )
        );
        const presentEdge = this.edges.find(
            (edge) =>
                edge.intermediateVersion.entryId === intermediateVersion.entryId
        );
        if (presentEdge) {
            return presentEdge;
        }
        const newEdge: RelationEdge = {
            sourceEntryId,
            targetEntryId,
            intermediateVersion,
        };
        this.updateEdges([...this.edges, newEdge]);
        return newEdge;
    }

    private getTable<T extends Table>(tableId: UUID) {
        return this.tables.find((table) => table.id === tableId) as T;
    }

    public destroy() {
        this.destroyed.next(undefined);
    }
}

interface RelationNode {
    readonly tableId: UUID;
    readonly entryId: UUID;
    readonly table: DefaultTable;
    readonly version?: Version;
    readonly version$: Promise<Version>;
    readonly status: 'collapsed' | 'collapsing' | 'expanded' | 'expanding';
    // These properties can be changed outside of the RelationExplorer class
    position?: {
        x: number;
        y: number;
    };
    /**
     * The foreign attributeIds that have already been expanded
     */
    readonly expandedAttributeIds: Set<UUID>;
}
interface RelationEdge {
    readonly sourceEntryId: UUID;
    readonly targetEntryId: UUID;
    readonly intermediateVersion: Version;
}
