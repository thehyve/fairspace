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

export const getContextualFileLink = (item, locationContext) => {
    const path = pathForIri(item);
    if (locationContext && locationContext !== "") {
        const parentPath = getParentPath(path);
        return `${getCollectionAbsolutePath(parentPath)}?selection=${encodeURIComponent(`/${path}`)}`;
    }
    return getCollectionAbsolutePath(path);
};

export const ofRangeValueType: boolean = (type: ValueType) => type === 'number' || type === 'date';

export const isCollectionView: boolean = (view: string) => view === 'collections';
