// @ts-nocheck
import {getSearchQueryFromString} from "../searchUtils";
describe('Search Utilities', () => {
    it('should get correct search query from string', () => {
        const query = getSearchQueryFromString('?q=hello');
        expect(query).toBe('hello');
    });
    it('should get empty query from string with no query', () => {
        const query = getSearchQueryFromString('?');
        expect(query).toBe('');
    });
});