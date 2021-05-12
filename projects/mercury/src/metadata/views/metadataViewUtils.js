import type {ValueType} from "./MetadataViewAPI";
import {MetadataViewColumn, TextualValueTypes} from "./MetadataViewAPI";

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

export const ofRangeValueType: boolean = (type: ValueType) => type === 'Number' || type === 'Date';

export const getInitialTextFilterMap: Object = (columns: MetadataViewColumn[]) => (
    Object.fromEntries(columns.filter(c => TextualValueTypes.includes(c.type)).map(c => ([c.name, ""])))
);
