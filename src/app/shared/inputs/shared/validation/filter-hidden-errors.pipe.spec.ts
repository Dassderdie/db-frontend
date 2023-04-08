import { FilterHiddenErrorsPipe } from './filter-hidden-errors.pipe';

describe('FilterHiddenErrorsPipe', () => {
    it('create an instance', () => {
        const pipe = new FilterHiddenErrorsPipe();
        expect(pipe).toBeTruthy();
    });

    it('filter hidden errors', () => {
        const pipe = new FilterHiddenErrorsPipe();
        expect(
            pipe.transform({
                a: { value: 2, hidden: true },
                b: { translationKey: 'sd', value: 2, hidden: false },
                c: { value: 2, hidden: true },
            })
        ).toEqual({
            b: { translationKey: 'sd', value: 2, hidden: false },
        });
    });
});
