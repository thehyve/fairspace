import { act } from 'react-dom/test-utils'

import {testHook} from "../../../utils/testUtils";
import useSorting from "../useSorting";

const items = [
    {
        label: 'item 1',
        fixed: 10,
        random: 3
    },
    {
        label: 'item 4',
        fixed: 10,
        random: 12
    },
    {
        label: 'item 3',
        fixed: 10,
        random: 5
    },
    {
        label: 'item 5',
        fixed: 10,
        random: 7
    },
    {
        label: 'item 2',
        fixed: 10,
        random: 12
    }
];

const columns = {
    label: {valueExtractor: 'label'},
    random: {valueExtractor: f => f.random},
    fixed: {valueExtractor: 'fixed'}
};

let sorting;

beforeEach(() => {
    testHook(() => {
        sorting = useSorting(items, columns, 'label');
    });
});

describe('useSorting custom hook', () => {
    it('should initialize by sorting the provided column', () => {
        expect(sorting.orderAscending).toBe(true);
        expect(sorting.orderBy).toEqual('label');
    });

    describe('toggleSort', () => {
        it('should reverse direction when toggling the selected column', () => {
            expect(sorting.orderAscending).toBe(true);
            expect(sorting.orderBy).toEqual('label');

            act(() => {
                sorting.toggleSort('label');
            });

            expect(sorting.orderAscending).toBe(false);
            expect(sorting.orderBy).toEqual('label');

            act(() => {
                sorting.toggleSort('label');
            });

            expect(sorting.orderAscending).toBe(true);
            expect(sorting.orderBy).toEqual('label');
        });
        it('should sort ascending if a new column is selected', () => {
            act(() => {
                sorting.toggleSort('label');
            });

            expect(sorting.orderAscending).toBe(false);

            act(() => {
                sorting.toggleSort('fixed');
            });

            expect(sorting.orderAscending).toBe(true);
            expect(sorting.orderBy).toEqual('fixed');
        });
    });

    it('should sort the items based on the selected column', () => {
        expect(sorting.orderedItems.map(i => i.label)).toEqual(['item 1', 'item 2', 'item 3', 'item 4', 'item 5']);
    });

    it('should sort the items on given order if values are the same', () => {
        act(() => {
            sorting.toggleSort('fixed');
        });
        expect(sorting.orderedItems).toEqual(items);
    });

    it('should sort the items if a function is given as value extractor', () => {
        act(() => {
            sorting.toggleSort('random');
        });
        expect(sorting.orderedItems.map(i => i.label)).toEqual(['item 1', 'item 3', 'item 5', 'item 4', 'item 2']);
    });
});
