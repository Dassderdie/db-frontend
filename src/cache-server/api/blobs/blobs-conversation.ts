import type { ApiConversationFactory } from '../api-conversation-factory';
import type { BlobsApi } from './blobs-api';

export type BlobsConversation = ApiConversationFactory<
    'blobs',
    BlobsApi,
    'downloadBlob' | 'uploadBlob'
>;
