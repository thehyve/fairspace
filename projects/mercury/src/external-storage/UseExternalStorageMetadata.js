import {useContext, useEffect, useState} from 'react';
import type {User} from '../users/UsersAPI';
import {formatDate, groupBy} from '../common/utils/genericUtils';
import {getDisplayName} from '../users/userUtils';
import MetadataAPI from '../metadata/common/MetadataAPI';
import {getLabel, getTypeInfo} from '../metadata/common/metadataUtils';
import VocabularyContext from '../metadata/vocabulary/VocabularyContext';
import UsersContext from '../users/UsersContext';
import FileAPI from '../file/FileAPI';

export type LabelValueProperty = {
    label: string,
    value: any
};

export type LinkedEntityProperty = {
    id: string,
    type: string,
    label: string
};

const ignoredProperties = [
    'filename',
    'basename',
    'displayname',
    'name',
    'type',
    'iri',
    'ownedBy',
    'ownedByCode',
    'access',
    'canRead',
    'canWrite',
    'canManage',
    'canDelete',
    'canUndelete',
    'canUnpublish',
    'accessMode',
    'isreadonly',
    'userPermissions',
    'availableStatuses',
    'workspacePermissions',
    'availableAccessModes',
    'status',
    'getcreated',
    'getcontenttype',
    'mime',
    'etag',
    'getetag',
    'iscollection',
    'supported-report-set',
    'resourcetype',
    'getlastmodified',
    'getcontentlength',
    'size',
    'metadataLinks',
    'version'
];

const mapFileProperties = (data: any = {}, users: User[] = []): Map<string, LabelValueProperty> => {
    if (!data || Object.keys(data).length === 0) {
        return {};
    }

    const defaultProperties = {
        comment: {
            label: 'Description',
            value: data.comment
        },
        lastmod: {
            label: 'Last modified',
            value: formatDate(data.lastmod)
        },
        createdBy: {
            label: 'Created by',
            value: getDisplayName(users.find(u => u.iri === data.createdBy))
        },
        creationdate: {
            label: 'Created',
            value: formatDate(data.creationdate)
        },
        contentType: {
            label: 'Content type',
            value: data.mime
        }
    };
    const propertiesToDisplay = Object.keys(data).filter(
        k => !ignoredProperties.includes(k) && !Object.keys(defaultProperties).includes(k)
    );
    const otherProperties = {};
    propertiesToDisplay.forEach(p => {
        otherProperties[p] = {value: data[p]};
    });

    return {...defaultProperties, ...otherProperties};
};

const mapLinkedMetadataProperties = (
    values: any[],
    vocabulary: any[]
): Map<string, LinkedEntityProperty> => {
    const metadataEntities: LinkedEntityProperty[] = values
        .map(value => ({
            id: value['@id'],
            type: getTypeInfo(value, vocabulary).label,
            label: getLabel(value)
        }))
        .filter(value => value.type != null);
    return groupBy(metadataEntities, 'type');
};

const useExternalStorageMetadata = (path: string, fileAPI: FileAPI) => {
    const [metadata, setMetadata] = useState({});
    const [linkedMetadataEntities, setLinkedMetadataEntities] = useState({});
    const [loading, setLoading] = useState(true);
    const [linkedMetadataEntitiesLoading, setLinkedMetadataEntitiesLoading] = useState(false);
    const [error, setError] = useState();

    const {vocabulary} = useContext(VocabularyContext);
    const {users} = useContext(UsersContext);

    const fetchLinkedMetadataEntities = (subjects = []) => {
        setLinkedMetadataEntitiesLoading(true);
        MetadataAPI.getForAllSubjects(subjects)
            .then(results => {
                if (results) {
                    const entityMap: Map<string, LinkedEntityProperty> =
                        mapLinkedMetadataProperties(results, vocabulary);
                    setLinkedMetadataEntities(entityMap);
                }
            })
            .catch(() => null)
            .finally(() => setLinkedMetadataEntitiesLoading(false));
    };
    const parseToArray = value => (typeof value !== 'string' ? [] : value.split(','));

    const fetchMetadata = () => {
        setLoading(true);
        fileAPI
            .stat(path, false, true)
            .then(results => {
                setMetadata(mapFileProperties(results, users));
                setError(undefined);
                if (results && results.metadataLinks) {
                    fetchLinkedMetadataEntities(parseToArray(results.metadataLinks));
                }
                setError(undefined);
            })
            .catch(e => {
                setError(e || true);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchMetadata();
    }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        loading,
        error,
        metadata,
        linkedMetadataEntities,
        linkedMetadataEntitiesLoading
    };
};

export default useExternalStorageMetadata;
