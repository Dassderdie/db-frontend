import type { Observable } from 'rxjs';

export interface ProgressResponse<T> {
    /**
     * the progress is
     */
    progress$: Observable<RequestProgress>;
    /**
     * the response from the request
     */
    data: Promise<T>;
}

export interface RequestProgress {
    /**
     * the number of already loaded chunks
     */
    loaded: number;
    /**
     * the total number of chunks to load
     */
    total: number;
}
