import {useContext, useEffect, useState} from "react";
import type {User} from "../users/UsersAPI";
import {formatDate, groupBy} from "../common/utils/genericUtils";
import {getDisplayName} from "../users/userUtils";
import MetadataAPI from "../metadata/common/MetadataAPI";
import {getLabel, getTypeInfo} from "../metadata/common/metadataUtils";
import VocabularyContext from "../metadata/vocabulary/VocabularyContext";
import UsersContext from "../users/UsersContext";
import FileAPI from "../file/FileAPI";

export type LabelValueProperty = {
    label: string;
    value: any;
}

export type LinkedEntityProperty = {
    id: string;
    type: string;
    label: string;
}

const ignoredProperties = [
    'filename', 'basename', 'displayname', 'name', 'type', 'iri', 'ownedBy', 'ownedByName',
    'access', 'canRead', 'canWrite', 'canManage', 'canDelete', 'canUndelete', 'accessMode', 'isreadonly',
    'userPermissions', 'availableStatuses', 'workspacePermissions', 'availableAccessModes',
    'status', 'getcreated', 'getcontenttype', 'etag', 'getetag', 'iscollection',
    'supported-report-set', 'resourcetype', 'getlastmodified', 'getcontentlength', 'size'
];

const mapFileProperties = (data: any = {}, users: User[] = []): Map<string, LabelValueProperty> => {
    if (!data || Object.keys(data).length === 0) {
        return {};
    }

    const defaultProperties = {
        comment: {
            label: "Description",
            value: data.comment
        },
        lastmod: {
            label: "Last modification date",
            value: formatDate(data.lastmod)
        },
        createdBy: {
            label: "Created by",
            value: getDisplayName(users.find(u => u.iri === data.createdBy))
        },
        creationdate: {
            label: "Creation date",
            value: formatDate(data.creationdate)
        }
    };
    const propertiesToDisplay = Object.keys(data).filter(
        k => !ignoredProperties.includes(k) && !Object.keys(defaultProperties).includes(k)
    );
    const otherProperties = {};
    propertiesToDisplay.forEach(p => {otherProperties[p] = {value: data[p]};});

    return {...defaultProperties, ...otherProperties};
};

const mapLinkedMetadataProperties = (values: any[], vocabulary: any[]): Map<string, LinkedEntityProperty> => {
    const metadataEntities: LinkedEntityProperty[] = values.map(value => ({
        id: value["@id"],
        type: getTypeInfo(value, vocabulary).label,
        label: getLabel(value)
    }));
    return groupBy(metadataEntities, "type");
};

const useExternalStorageMetadata = (path: string, fileAPI: FileAPI) => {
    const [metadata, setMetadata] = useState({});
    const [linkedMetadataEntities, setLinkedMetadataEntities] = useState({});
    const [loading, setLoading] = useState(true);
    const [linkedMetadataEntitiesLoading, setLinkedMetadataEntitiesLoading] = useState(false);
    const [error, setError] = useState();

    const {vocabulary} = useContext(VocabularyContext);
    const {users} = useContext(UsersContext);

    const fetchLinkedMetadataEntities = (subjects) => {
        setLinkedMetadataEntitiesLoading(true);
        MetadataAPI.getForAllSubjects(subjects)
            .then(results => {
                if (results) {
                    const entityMap: Map<string, LinkedEntityProperty> = mapLinkedMetadataProperties(results, vocabulary);
                    setLinkedMetadataEntities(entityMap);
                }
            })
            .finally(() => setLinkedMetadataEntitiesLoading(false));
    };

    const fetchMetadata = () => {
        setLoading(true);
        fileAPI.stat(path)
            .then(results => {
                setMetadata(mapFileProperties(results, users));
                setError(undefined);
                // const metadataLinks = [
                //     "http://example.com/samples#fca7f4de-66f5-4807-b776-59529d338a1f",
                //     "invalid",
                //     "http://example.com/events#70259637-1a8d-46f4-aaa6-847830ce09a5"
                // ];
                // fetchLinkedMetadataEntities(metadataLinks);
                if (results && results.metadataLinks) {
                    fetchLinkedMetadataEntities(results.metadataLinks);
                }
                setError(undefined);
            })
            .catch((e) => {
                setError(e || true);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {fetchMetadata();}, [path]);

    return {
        loading,
        error,
        metadata,
        linkedMetadataEntities,
        linkedMetadataEntitiesLoading
    };
};

export default useExternalStorageMetadata;
