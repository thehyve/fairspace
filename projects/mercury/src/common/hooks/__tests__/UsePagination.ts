// @ts-nocheck
import {act} from "react-dom/test-utils";
import {testHook} from "../../utils/testUtils";
import usePagination from "../UsePagination";
const items = ['item 1', 'item 4', 'item 3', 'item 2', 'item 5'];
const initialRowsPerPage = 2;
let pagination;
beforeEach(() => {
    testHook(() => {
        pagination = usePagination(items, initialRowsPerPage);
    });
});
describe('usePagination custom hook', () => {
    it('should initialize to the given number of rows per page', () => {
        expect(pagination.rowsPerPage).toEqual(initialRowsPerPage);
        expect(pagination.pagedItems).toEqual(items.slice(0, 2));
    });
    it('should reset page when rowsPerPage changes', () => {
        act(() => {
            pagination.setPage(2);
            pagination.setRowsPerPage(1);
        });
        expect(pagination.page).toEqual(0);
        expect(pagination.pagedItems).toEqual([items[0]]);
    });
    it('should return the right page with results', () => {
        act(() => {
            pagination.setPage(1);
        });
        expect(pagination.pagedItems).toEqual(items.slice(2, 4));
    });
    it('should not fail when last page contains less items than a full page', () => {
        act(() => {
            pagination.setPage(2);
        });
        expect(pagination.pagedItems).toEqual([items[4]]);
    });
    it('should not fail when page is out of bounds', () => {
        act(() => {
            pagination.setPage(100);
        });
        expect(pagination.pagedItems).toEqual([]);
    });
});