import type { ApiConversationFactory } from '../api-conversation-factory';
import type { VersionsApi } from './versions-api';

export type VersionsConversation = ApiConversationFactory<
    'versions',
    VersionsApi,
    'updateVersions',
    'getNewestVersion' | 'getVersions'
>;
