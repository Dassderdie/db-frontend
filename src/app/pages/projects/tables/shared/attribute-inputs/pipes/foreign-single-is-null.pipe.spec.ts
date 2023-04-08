import { ForeignSingleIsNullPipe } from './foreign-single-is-null.pipe';

describe('ForeignSingleIsNullPipe', () => {
    it('create an instance', () => {
        const pipe = new ForeignSingleIsNullPipe();
        expect(pipe).toBeTruthy();
    });
});
