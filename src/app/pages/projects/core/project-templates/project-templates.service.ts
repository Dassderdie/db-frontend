import { Injectable } from '@angular/core';
import type { NewProject, Project } from '@cache-server/api/projects/project';
import type {
    Attribute,
    ForeignAttribute,
    ForeignEditAttribute,
    NewAttribute,
} from '@cache-server/api/tables/attribute';
import type {
    DefaultTable,
    NewTable,
    Table,
} from '@cache-server/api/tables/table';
import type { UUID } from '@cache-server/api/uuid';
import { baseUrl } from '@cache-server/http-handler/default-base-url';
import { ProjectsService } from '@core/cache-client/api/projects/projects.service';
import { TablesService } from '@core/cache-client/api/tables/tables.service';
import { saveBlob } from '@shared/utility/functions/save-blob';
import {
    attributeToEditAttribute,
    convertTableToEditTable,
} from '@tables-editor/pages/editable-table';
import { environment } from 'src/environments/environment';
import type { ProgressCounter } from '@shared/utility/components/global-loading-placeholder/progress-counter';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ProjectTemplatesService {
    constructor(
        private readonly tablesService: TablesService,
        private readonly projectsService: ProjectsService
    ) {}

    private projectTemplates?: ReadonlyArray<ProjectTemplate>;

    public async exportProjectTemplate(projectId: UUID) {
        const project = await firstValueFrom(
            this.projectsService.getProject(projectId)
        );
        const tables = await firstValueFrom(
            this.tablesService.getTables(projectId)
        );
        const projectTemplate: ProjectTemplate = {
            project,
            tables,
        };
        const blob = new Blob([JSON.stringify(projectTemplate, undefined, 4)], {
            type: 'application/json',
        });
        saveBlob(blob, project.name);
    }

    public async getProjectTemplates(): Promise<
        ReadonlyArray<ProjectTemplate>
    > {
        if (!environment.hasProjectTemplates) {
            return [];
        }
        return (
            this.projectTemplates ??
            fetch(`${baseUrl}/assets/project-templates.json`)
                .then(async (data) => data.json())
                .then((projectTemplates: ReadonlyArray<ProjectTemplate>) => {
                    this.projectTemplates = projectTemplates;
                    return projectTemplates;
                })
                .catch((error: any) => {
                    errors.error({ error });
                    return [];
                })
        );
    }

    public async applyProjectTemplate(
        projectTemplate: ProjectTemplate,
        progressCounter: ProgressCounter
    ) {
        progressCounter.updateMaximum(
            this.getMaximumNumberOfRequests(projectTemplate)
        );
        // create the project
        const project = projectTemplate.project;
        const newProject: NewProject = {
            name: project.name,
            description: project.description,
        };
        const createdProject = await this.projectsService.createProject(
            newProject
        );
        progressCounter.updateProgress(1);
        const projectId = createdProject.id;
        await this.projectsService.editProject(
            projectId,
            project.name,
            project.description,
            project.allowAnonymousVersionCreation
        );
        progressCounter.updateProgress(1);
        const templateIds: TemplateIds = {};
        const defaultTemplateTables = projectTemplate.tables.flatMap(
            (templateTable) =>
                templateTable.type === 'default' ? [templateTable] : []
        );
        // create all tables except foreign stuff
        await Promise.all(
            defaultTemplateTables.map(async (templateTable) => {
                const createdTable = await this.tablesService.createTable(
                    this.tableToNewTable(templateTable, projectId),
                    false
                );
                templateIds[templateTable.id] = createdTable.id;
                progressCounter.updateProgress(1);
                return createdTable;
            })
        );
        //  we assume the id of a foreignAttribute is globally unique
        const templateForeignAttributeBlackList: UUID[] = [];
        // create foreign attributes (order gets ignored)
        for (const templateTable of defaultTemplateTables) {
            // create foreign attributes that do not connect to intermediateTables (if there are any)
            const foreignAttributeTemplates = templateTable.attributes.filter(
                (attribute) =>
                    attribute.kind === 'foreign' &&
                    !!templateIds[attribute.kindOptions.foreign.tableId] &&
                    !templateForeignAttributeBlackList.includes(attribute.id)
            ) as ForeignAttribute[];
            if (!foreignAttributeTemplates.length) {
                continue;
            }
            const currentTable = // eslint-disable-next-line no-await-in-loop
            (await this.tablesService.getCurrentTables(projectId)).find(
                (table) => table.id === templateIds[templateTable.id]!
            ) as DefaultTable;
            errors.assert(currentTable?.type === 'default');
            const editTable = convertTableToEditTable(currentTable);
            // eslint-disable-next-line no-await-in-loop
            const editedTable = await this.tablesService.editTable(
                {
                    ...editTable,
                    attributes: [
                        ...editTable.attributes,
                        ...foreignAttributeTemplates.flatMap(
                            (templateAttribute) => {
                                const newAttribute =
                                    this.attributeToNewAttribute(
                                        templateAttribute,
                                        templateIds,
                                        templateForeignAttributeBlackList
                                    );
                                return newAttribute ? [newAttribute] : [];
                            }
                        ),
                    ],
                },
                false
            );
            progressCounter.updateProgress(1);
            // eslint-disable-next-line no-await-in-loop
            await this.updateConnectedForeignAttributes(
                // eslint-disable-next-line no-await-in-loop
                await this.tablesService.getCurrentTables(projectId),
                editedTable.attributes,
                projectTemplate.tables,
                foreignAttributeTemplates,
                projectId,
                progressCounter
            );
        }
        progressCounter.destroy();
    }

    private async updateConnectedForeignAttributes(
        currentTables: ReadonlyArray<Table>,
        createdAttributes: ReadonlyArray<Attribute>,
        templateTables: ReadonlyArray<Table>,
        templateAttributes: ReadonlyArray<Attribute>,
        projectId: UUID,
        progressCounter: ProgressCounter
    ) {
        // update all the other connected ForeignAttributes
        // the order is the same in the intermediateAttributes
        const createdForeignAttributes = createdAttributes.filter(
            (attribute) => attribute.kind === 'foreign'
        ) as ReadonlyArray<ForeignAttribute>;
        const templateForeignAttributes = templateAttributes.filter(
            (attribute) => attribute.kind === 'foreign'
        ) as ReadonlyArray<ForeignAttribute>;
        errors.assert(
            createdForeignAttributes.length === templateForeignAttributes.length
        );
        // eslint-disable-next-line unicorn/no-for-loop
        for (let i = 0; i < templateForeignAttributes.length; i++) {
            const createdForeignAttribute = createdForeignAttributes[i]!;
            const templateForeignAttribute = templateForeignAttributes[i]!;
            const createdConnectedForeignAttribute =
                this.getConnectedForeignAttribute(
                    currentTables,
                    createdForeignAttribute
                );
            const templateConnectedForeignAttribute =
                this.getConnectedForeignAttribute(
                    templateTables,
                    templateForeignAttribute
                );
            // update the connected (automatically created) foreignAttribute
            const editTable = convertTableToEditTable(
                createdConnectedForeignAttribute.table
            );
            // eslint-disable-next-line no-await-in-loop
            await this.tablesService.editTable(
                {
                    ...editTable,
                    attributes: [
                        ...editTable.attributes
                            // Remove the automatically created second ForeignAttribute
                            .filter(
                                (attribute) =>
                                    attribute.id !==
                                    createdConnectedForeignAttribute.attribute
                                        .id
                            ),
                        // Add the updated Attribute
                        this.updateForeignAttribute(
                            createdConnectedForeignAttribute.attribute,
                            templateConnectedForeignAttribute.attribute
                        ),
                    ],
                },
                false
            );
            progressCounter.updateProgress(1);
            // eslint-disable-next-line no-await-in-loop
            await this.updateConnectedForeignAttributes(
                // eslint-disable-next-line no-await-in-loop
                await this.tablesService.getCurrentTables(projectId),
                createdForeignAttribute.kindOptions.intermediateAttributes,
                templateTables,
                templateForeignAttribute.kindOptions.intermediateAttributes,
                projectId,
                progressCounter
            );
        }
    }

    private getConnectedForeignAttribute(
        currentTables: ReadonlyArray<Table>,
        foreignAttribute: ForeignAttribute
    ) {
        const connectedTable = currentTables.find(
            (table) => table.id === foreignAttribute.kindOptions.foreign.tableId
        ) as DefaultTable;
        errors.assert(connectedTable?.type === 'default');
        const connectedForeignAttribute = connectedTable.attributes.find(
            (attribute) =>
                attribute.id ===
                foreignAttribute.kindOptions.foreign.attributeId
        ) as ForeignAttribute;
        return {
            table: connectedTable,
            attribute: connectedForeignAttribute,
        };
    }

    private updateForeignAttribute(
        createdForeignAttribute: ForeignAttribute,
        templateForeignAttribute: ForeignAttribute
    ): ForeignEditAttribute {
        return {
            ...(attributeToEditAttribute(
                createdForeignAttribute
            ) as ForeignEditAttribute),
            descriptions: templateForeignAttribute.descriptions,
            displayNames: templateForeignAttribute.displayNames,
            hidden: templateForeignAttribute.hidden,
            indexed: templateForeignAttribute.indexed,
            required: templateForeignAttribute.required,
            unique: templateForeignAttribute.unique,
        };
    }

    private tableToNewTable(table: DefaultTable, projectId: UUID): NewTable {
        return {
            projectId,
            coordinates: table.coordinates,
            displayNames: table.displayNames,
            descriptions: table.descriptions,
            allowAnonymousVersionCreation: table.allowAnonymousVersionCreation,
            attributes: table.attributes
                // the foreignAttributes will be created in a second iteration
                .filter((attribute) => attribute.kind !== 'foreign')
                .flatMap((attr) => {
                    const newAttribute = this.attributeToNewAttribute(
                        attr,
                        {},
                        []
                    );
                    return newAttribute ? [newAttribute] : [];
                }),
        };
    }

    private attributeToNewAttribute(
        attribute: Attribute,
        templateIds: TemplateIds,
        templateForeignAttributeBlackList: UUID[]
    ): NewAttribute | undefined {
        if (attribute.kind !== 'foreign') {
            return {
                ...attribute,
                id: undefined,
            };
        }
        const foreignTableId =
            templateIds[attribute.kindOptions.foreign.tableId];
        if (
            // if the foreignTableId is not found this means the foreignTable is an intermediateTable. In this case the foreignAttribute will be created via an intermediateForeignAttribute
            !foreignTableId ||
            // if the attribute is in the blacklist the other connected foreignAttribute has already created this relation
            templateForeignAttributeBlackList.includes(attribute.id)
        ) {
            return undefined;
        }
        templateForeignAttributeBlackList.push(
            attribute.kindOptions.foreign.attributeId!
        );
        return {
            ...attribute,
            id: undefined,
            kindOptions: {
                ...attribute.kindOptions,
                foreign: {
                    ...attribute.kindOptions.foreign,
                    tableId: foreignTableId,
                    attributeId: undefined,
                },
                intermediateTableId: undefined,
                intermediateAttributes:
                    attribute.kindOptions.intermediateAttributes.flatMap(
                        (attr) => {
                            const newAttribute = this.attributeToNewAttribute(
                                attr,
                                templateIds,
                                templateForeignAttributeBlackList
                            );
                            return newAttribute ? [newAttribute] : [];
                        }
                    ),
            },
        };
    }

    private getMaximumNumberOfRequests(projectTemplate: ProjectTemplate) {
        return (
            2 + // createProject + editProject
            projectTemplate.tables.filter((table) => table.type === 'default')
                .length + // each table has to be created
            projectTemplate.tables
                .map(
                    (table) =>
                        table.attributes.filter(
                            (attribute) => attribute.kind === 'foreign'
                        ).length
                )
                .reduce((a, b) => a + b, 0)
        ); // for each foreignAttribute a request has to be made (1. create it, 2. update the newly created counterpart)
    }
}

export interface ProjectTemplate {
    project: Project;
    tables: ReadonlyArray<Table>;
}

interface TemplateIds {
    [oldTableId: string]: UUID;
}
