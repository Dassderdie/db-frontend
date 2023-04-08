import { getUUIDFromUrl } from './get-uuid-from-url';

describe('getIdFromUrl', () => {
    it('should correctly extract the ids from urls', () => {
        const url =
            'https://koppadb.com/p/003d6d27-b06b-43b6-bc4e-80bbd7e8ebbf/t/b6b8c730-1f29-464f-902f-464decf8d780/e/7a790c4e-c6a5-4c29-8761-95a310760d82/o';
        const projectId = getUUIDFromUrl(url, '/p/', '/t/');
        expect(projectId).toEqual('003d6d27-b06b-43b6-bc4e-80bbd7e8ebbf');
        const tableId = getUUIDFromUrl(url, '/t/', '/e/');
        expect(tableId).toEqual('b6b8c730-1f29-464f-902f-464decf8d780');
        const entryId = getUUIDFromUrl(url, '/e/', '/');
        expect(entryId).toEqual('7a790c4e-c6a5-4c29-8761-95a310760d82');
    });

    it('should correctly handle invalid urls', () => {
        const url = 'https://koppadb.com/p/324234/t//e/o';
        const projectId = getUUIDFromUrl(url, '/p/', '/t/');
        expect(projectId).toEqual(undefined);
        const tableId = getUUIDFromUrl(url, '/t/', '/e/');
        expect(tableId).toEqual(undefined);
        const entryId = getUUIDFromUrl(url, '/e/', '');
        expect(entryId).toEqual(undefined);
    });
});
