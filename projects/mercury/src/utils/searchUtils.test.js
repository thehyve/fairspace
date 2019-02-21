import {buildSearchUrl, getSearchTypeFromString, getSearchQueryFromString} from './searchUtils';

describe('Search Utilities', () => {
    it('should build correct search url', () => {
        const url = buildSearchUrl('collections', 'findings');
        expect(url).toBe('/search?q=findings&type=collections');
    });

    it('should return no query paramters on empty or undefined type and/or query', () => {
        const url = buildSearchUrl('', '');
        const url2 = buildSearchUrl(null, undefined);
        const url3 = buildSearchUrl(undefined, null);

        expect(url).toBe('/search');
        expect(url2).toBe('/search');
        expect(url3).toBe('/search');
    });

    it('should build string even when query is missing', () => {
        const url = buildSearchUrl('randomType', '');
        expect(url).toBe('/search?q=&type=randomType');
    });

    it('should get "collections" as a type from string', () => {
        const type = getSearchTypeFromString('/search?q=a&type=collections');
        expect(type).toBe('collections');
    });

    it('should get "files" as a type from string', () => {
        const type = getSearchTypeFromString('?q=a&type=files');
        expect(type).toBe('files');
    });

    it('should get default "collections" as a type from string with no type', () => {
        const type = getSearchTypeFromString('?q=a');
        expect(type).toBe('collections');
    });

    it('should get correct search query from string', () => {
        const query = getSearchQueryFromString('?q=hello&type=collections');
        expect(query).toBe('hello');
    });

    it('should get emprt query from string with no query', () => {
        const query = getSearchQueryFromString('?type=collections');
        expect(query).toBe('');
    });
});
