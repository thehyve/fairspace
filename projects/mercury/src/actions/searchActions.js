
import {OPEN_SEARCH} from "./actionTypes";

export const openSearch = (term, searchType = 'collections') => (
    {type: OPEN_SEARCH, term}
);

export const doSearch = (term, searchType = 'collections') => (
    {type: OPEN_SEARCH, term}
);
