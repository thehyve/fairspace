import * as consts from '../../constants';

export type ExternalMetadataSource = {
    path: string,
    name: string,
    label: string
};

export const getExternalMetadataSourcePathPrefix = (sourceName: string) =>
    consts.PATH_SEPARATOR + 'metadata-sources' + consts.PATH_SEPARATOR + sourceName;
