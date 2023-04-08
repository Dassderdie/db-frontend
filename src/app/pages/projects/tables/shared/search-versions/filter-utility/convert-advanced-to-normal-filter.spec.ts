import { convertAdvancedToNormalFilter } from './convert-advanced-to-normal-filter';

describe('convertToUnadvancedFilter', () => {
    it('should correctly convert an advanced filter to an not advancedFilter 1', () => {
        expect(
            convertAdvancedToNormalFilter({
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
        ).toEqual({
            type: 'and',
            expressions: [],
        });
    });

    it('should correctly convert an advanced filter to an not advancedFilter 2', () => {
        // Backwards compatibility to pre v0.1.1
        expect(
            convertAdvancedToNormalFilter({
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
        ).toEqual({
            type: 'and',
            expressions: [
                {
                    key: 'c220c965-130c-41ad-9b50-d4bc436f9b44',
                    type: 'less',
                    value: 0,
                },
            ],
        });
    });

    it('should correctly convert an advanced filter to an not advancedFilter 3', () => {
        expect(
            convertAdvancedToNormalFilter({
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
        ).toEqual({
            type: 'or',
            expressions: [
                {
                    key: 'c220c965-130c-41ad-9b50-d4bc436f9b44',
                    type: 'less',
                    value: 0,
                },
            ],
        });
    });
});
