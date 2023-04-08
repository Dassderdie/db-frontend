export interface HttpResponse<T> {
    status: number;
    error: string;
    data: T;
}

export type HttpResponsePromise<T> = Promise<HttpResponse<T>>;
