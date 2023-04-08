import { appliedFilterIsAdvancedFilter } from './applied-filter-is-advanced-filter';

describe('isAdvancedFilter', () => {
    it('should correctly determine wether a filter is advanced 1', () => {
        expect(
            appliedFilterIsAdvancedFilter({
                type: 'and',
                expressions: [
                    { key: 'deleted', value: false, type: 'equal' },
                    {
                        key: 'invalidatedAt',
                        type: 'equal',
                        value: null,
                    },
                ],
            })
        ).toBeFalse();
    });

    it('should correctly determine wether a filter is advanced 2', () => {
        expect(
            appliedFilterIsAdvancedFilter({
                type: 'or',
                expressions: [
                    { key: 'deleted', value: false, type: 'equal' },
                    {
                        key: 'invalidatedAt',
                        type: 'equal',
                        value: null,
                    },
                ],
            })
        ).toBeTrue();
    });

    it('should correctly determine wether a filter is advanced 3', () => {
        expect(
            appliedFilterIsAdvancedFilter({
                type: 'and',
                expressions: [
                    { key: 'deleted', value: false, type: 'equal' },
                    {
                        key: 'invalidatedAt',
                        type: 'equal',
                        value: null,
                    },
                    {
                        key: 'c220c965-130c-41ad-9b50-d4bc436f9b44',
                        type: 'less',
                        value: 0,
                    },
                ],
            })
        ).toBeFalse();
    });

    it('should correctly determine wether a filter is advanced 4', () => {
        expect(
            appliedFilterIsAdvancedFilter({
                type: 'and',
                expressions: [
                    { key: 'deleted', value: false, type: 'equal' },
                    {
                        key: 'invalidatedAt',
                        type: 'equal',
                        value: null,
                    },
                    {
                        type: 'or',
                        expressions: [
                            {
                                key: 'c220c965-130c-41ad-9b50-d4bc436f9b44',
                                type: 'less',
                                value: 0,
                            },
                        ],
                    },
                ],
            })
        ).toBeFalse();
    });

    it('should correctly determine wether a filter is advanced 5', () => {
        expect(
            appliedFilterIsAdvancedFilter({
                type: 'and',
                expressions: [
                    { key: 'deleted', value: false, type: 'equal' },
                    {
                        key: 'invalidatedAt',
                        type: 'equal',
                        value: null,
                    },
                    {
                        type: 'or',
                        expressions: [
                            {
                                key: 'c220c965-130c-41ad-9b50-d4bc436f9b44',
                                type: 'less',
                                value: 0,
                            },
                            {
                                key: 'invalidatedAt',
                                type: 'equal',
                                value: 'any',
                            },
                        ],
                    },
                ],
            })
        ).toBeTrue();
    });

    it('should correctly determine wether a filter is advanced 6', () => {
        expect(
            appliedFilterIsAdvancedFilter({
                type: 'and',
                expressions: [
                    { key: 'deleted', value: true, type: 'equal' },
                    {
                        key: 'invalidatedAt',
                        type: 'equal',
                        value: null,
                    },
                ],
            })
        ).toBeTrue();
    });
});
