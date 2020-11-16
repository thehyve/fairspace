import {Grain, AssignmentInd, Assignment, Folder} from "@material-ui/icons";
import React from "react";
import type {MetadataViewOptions, ValueType} from "./MetadataViewAPI";
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
export const LINKED_FILES_COLUMN_NAME = 'files';

export const applyViewIcons = (views: MetadataViewOptions[]): MetadataViewOptions[] => views.map(view => {
    let icon = <Assignment />;
    if (view.name === 'subjects') {
        icon = <AssignmentInd />;
    } else if (view.name === 'samples') {
        icon = <Grain />;
    } else if (view.name === 'collections') {
        icon = <Folder />;
    }
    return {...view, icon};
});

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
