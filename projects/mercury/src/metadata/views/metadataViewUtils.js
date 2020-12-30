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

export const ofRangeValueType: boolean = (type: ValueType) => type === 'Number' || type === 'Date';
