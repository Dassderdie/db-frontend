import type { ApiConversationFactory } from '../api-conversation-factory';
import type { ProjectsApi } from './projects-api';

export type ProjectsConversation = ApiConversationFactory<
    'projects',
    ProjectsApi,
    'createProject' | 'deleteProject' | 'editProject',
    'getProject' | 'getProjects'
>;
