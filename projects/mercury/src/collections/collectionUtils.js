import {buildSearchUrl} from "../search/searchUtils";

export const getCollectionAbsolutePath = (location) => `/collections/${location}`;

export const handleCollectionSearchRedirect = (history, value) => {
    const searchUrl = value ? buildSearchUrl(value) : '';
    history.push(`/collections${searchUrl}`);
};
