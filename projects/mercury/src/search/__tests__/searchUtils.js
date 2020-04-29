import {buildSearchUrl, getSearchQueryFromString} from '../searchUtils';

describe('Search Utilities', () => {
    it('should build correct search url', () => {
        const url = buildSearchUrl('findings');
        expect(url).toBe('/search?q=findings');
    });

    it('should return no query paramters on empty or undefined query', () => {
        const url = buildSearchUrl('');
        const url2 = buildSearchUrl(null);
        const url3 = buildSearchUrl(undefined);

        expect(url).toBe('/search');
        expect(url2).toBe('/search');
        expect(url3).toBe('/search');
    });

    it('should get correct search query from string', () => {
        const query = getSearchQueryFromString('?q=hello');
        expect(query).toBe('hello');
    });

    it('should get emprt query from string with no query', () => {
        const query = getSearchQueryFromString('?');
        expect(query).toBe('');
    });
});
