import { convertNormalToAdvancedFilter } from './convert-normal-to-advanced-filter';

describe('convertToAdvancedFilter', () => {
    it('should correctly convert an not advanced filter to an advancedFilter 1', () => {
        expect(
            convertNormalToAdvancedFilter({
                type: 'and',
                expressions: [
                    {
                        key: 'c220c965-130c-41ad-9b50-d4bc436f9b44',
                        type: 'less',
                        value: 0,
                    },
                    {
                        key: 'invalidatedAt',
                        type: 'equal',
                        value: null,
                    },
                ],
            })
        ).toEqual({
            type: 'and',
            expressions: [
                { key: 'deleted', value: false, type: 'equal' },
                {
                    key: 'invalidatedAt',
                    type: 'equal',
                    value: null,
                },
                {
                    type: 'and',
                    expressions: [
                        {
                            key: 'c220c965-130c-41ad-9b50-d4bc436f9b44',
                            type: 'less',
                            value: 0,
                        },
                        {
                            key: 'invalidatedAt',
                            type: 'equal',
                            value: null,
                        },
                    ],
                },
            ],
        });
    });

    it('should correctly convert an not advanced filter to an advancedFilter 2', () => {
        expect(
            convertNormalToAdvancedFilter({
                type: 'or',
                expressions: [],
            })
        ).toEqual({
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
                    expressions: [],
                },
            ],
        });
    });

    it('should correctly convert an not advanced filter to an advancedFilter 3', () => {
        expect(
            convertNormalToAdvancedFilter({
                type: 'or',
                expressions: [
                    {
                        key: 'c220c965-130c-41ad-9b50-d4bc436f9b44',
                        type: 'less',
                        value: 0,
                    },
                ],
            })
        ).toEqual({
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
        });
    });
});
