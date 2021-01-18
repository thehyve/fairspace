import type {ValueType} from "./MetadataViewAPI";
import {getCollectionAbsolutePath, pathForIri} from "../../collections/collectionUtils";
import {getParentPath} from "../../file/fileUtils";

export const RESOURCES_VIEW = "Resource";

export type MetadataViewEntity = {
    iri: string;
    label: string;
}

export type MetadataViewEntityWithLinkedFiles = MetadataViewEntity & {|
    linkedFiles: MetadataViewEntity[];
|}

export const getMetadataViewsPath = (viewName: string) => {
    let path = '/metadata-views';
    if (viewName) {
        path += `?view=${viewName}`;
    }
    return path;
};

export const getContextualFileLink = (item: string) => {
    const path = pathForIri(item);
    const parentPath = getParentPath(path);
    if (parentPath) {
        return `${getCollectionAbsolutePath(parentPath)}?selection=${encodeURIComponent(`/${path}`)}`;
    }
    return getCollectionAbsolutePath(path);
};

export const ofRangeValueType: boolean = (type: ValueType) => type === 'Number' || type === 'Date';
