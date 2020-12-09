import type {ValueType} from "./MetadataViewAPI";
import {getCollectionAbsolutePath, pathForIri} from "../../collections/collectionUtils";
import {getParentPath} from "../../file/fileUtils";

export type MetadataViewEntity = {
    iri: string;
    label: string;
}

export type MetadataViewEntityWithLinkedFiles = MetadataViewEntity & {|
    linkedFiles: MetadataViewEntity[];
|}

export const LOCATION_FILTER_FIELD = 'belongsTo';
export const FILE_VIEW_NAME = 'files';

export const getMetadataViewsPath = (currentViewName) => {
    let path = '/metadata-views';
    if (currentViewName) {
        path += `?view=${currentViewName}`;
    }
    return path;
};

export const getContextualFileLink = (item) => {
    const path = pathForIri(item);
    const parentPath = getParentPath(path);
    if (parentPath) {
        return `${getCollectionAbsolutePath(parentPath)}?selection=${encodeURIComponent(`/${path}`)}`;
    }
    return getCollectionAbsolutePath(path);
};

export const getPathSegments = (context) => {
    const segments = ((context && pathForIri(context)) || '').split('/');
    const result = [];
    if (segments[0] === '') {
        return result;
    }

    const pathPrefix = getMetadataViewsPath(FILE_VIEW_NAME) + '&context=';
    let path = context;
    segments.reverse().forEach(segment => {
        result.push({label: segment, href: (pathPrefix + encodeURIComponent(path))});
        path = getParentPath(path);
    });
    return result.reverse();
};

export const ofRangeValueType: boolean = (type: ValueType) => type === 'number' || type === 'date';

export const isFilesView: boolean = (view: string) => view === FILE_VIEW_NAME;
