import * as consts from '../../constants';

export type MetadataSource = {
    label: string,
    iconPath: string,
    icon: string // URL to the crated svg `Blob` object
};

export type ExternalMetadataSource = MetadataSource & {
    path: string,
    name: string
};

export const getExternalMetadataSourcePathPrefix = (sourceName: string) =>
    consts.PATH_SEPARATOR + 'metadata-sources' + consts.PATH_SEPARATOR + sourceName;
