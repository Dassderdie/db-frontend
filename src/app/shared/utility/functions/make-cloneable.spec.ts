import { makeCloneable } from './make-cloneable';

describe('make-cloneable', () => {
    it('handels primitive values', () => {
        expect(makeCloneable(1)).toEqual(1);
        expect(makeCloneable('string')).toEqual('string');
        expect(makeCloneable(null)).toEqual(null);
        expect(makeCloneable(true)).toEqual(true);
        expect(makeCloneable(undefined)).toEqual(undefined);
    });

    it('handels functions', () => {
        expect(makeCloneable(() => 2)).toEqual(undefined);
        expect(makeCloneable(() => ({ a: 1 }))).toEqual(undefined);
    });

    it('handels objects with a one level deep function', () => {
        const objectWithFunction = {
            a: 1,
            b: () => 2,
        };
        expect(makeCloneable(objectWithFunction)).toEqual({
            a: 1,
        });
    });

    it('handels objects with multiple level deep functions', () => {
        const objectWithFunctions = {
            a: 1,
            b: () => 2,
            c: {
                d: '11',
                e: function a() {
                    return {};
                },
            },
        };
        expect(makeCloneable(objectWithFunctions)).toEqual({
            a: 1,
            c: {
                d: '11',
            },
        });
    });
});
