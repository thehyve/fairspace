// @flow
// eslint-disable-next-line import/no-cycle
import {mapFilePropertiesToCollection} from "./collectionUtils";
import {handleHttpError} from '../common/utils/httpUtils';
import {LocalFileAPI} from "../file/FileAPI";
import MetadataAPI from "../metadata/common/MetadataAPI";
import {COMMENT_URI} from "../constants";

const rootUrl = '';

export type AccessLevel = 'None' | 'List' | 'Read' | 'Write' | 'Manage';
export const accessLevels: AccessLevel[] = ['None', 'List', 'Read', 'Write', 'Manage'];
export type AccessMode = 'Restricted' | 'MetadataPublished' | 'DataPublished';
export const accessModes: AccessMode[] = ['Restricted', 'MetadataPublished', 'DataPublished'];
export type Status = 'Active' | 'ReadOnly' | 'Archived';
export const statuses: Status[] = ['Active', 'ReadOnly', 'Archived'];

export type Permission = {
    iri: string; // iri
    access: AccessLevel;
}

export type Principal = {|
    iri: string;
    name: string;
|};

export type PrincipalPermission = Permission & Principal;

export type CollectionProperties = {|
    name: string;
    description: string;
    ownerWorkspace: string;
|};

export type CollectionType = {|
    type?: string;
|};

export type CollectionPermissions = {|
    userPermissions: Permission[];
    workspacePermissions: Permission[];
    canRead: boolean;
    canWrite: boolean;
    canManage: boolean;
    canDelete: boolean;
    canUndelete: boolean;
    canUnpublish: boolean;
    access: AccessLevel;
|};

export type Resource = {|
    iri: string;
|};

export type CollectionAuditInfo = {|
    dateCreated?: string;
    createdBy?: string; // iri
    dateModified?: string;
    modifiedBy?: string; // iri
    dateDeleted?: string;
    deletedBy?: string; // iri
    accessMode: AccessMode;
    status?: Status;
    availableAccessModes: AccessMode[];
    availableStatuses: Status[];
    statusDateModified?: string;
    statusModifiedBy?: string; // iri
|};

export type Collection = Resource & CollectionProperties & CollectionType & CollectionPermissions & CollectionAuditInfo;

class CollectionAPI {
    getCollectionProperties(name: string): Promise<Collection> {
        return LocalFileAPI.stat(name).then(mapFilePropertiesToCollection);
    }

    getCollections(showDeleted = false): Promise<Collection[]> {
        return LocalFileAPI.list(rootUrl, showDeleted)
            .then(collections => collections.map(mapFilePropertiesToCollection))
            .catch(handleHttpError("Failure when retrieving a list of collections"));
    }

    addCollection(collection: CollectionProperties, vocabulary): Promise<void> {
        const options = {
            headers: {
                Owner: collection.ownerWorkspace
            },
            withCredentials: true
        };
        return LocalFileAPI.createDirectory(collection.name, options)
            .then(() => this.getCollectionProperties(collection.name))
            .then((properties) => {
                collection.iri = properties.iri;
                return this.updateCollection(collection, vocabulary);
            });
    }

    deleteCollection(collection: CollectionProperties, showDeleted = false): Promise<void> {
        return LocalFileAPI.delete(collection.name, showDeleted)
            .catch(handleHttpError("Failure while deleting collection"));
    }

    undeleteCollection(collection: CollectionProperties): Promise<void> {
        return LocalFileAPI.undelete(collection.name)
            .catch(handleHttpError("Failure while undeleting collection"));
    }

    unpublish(collection: CollectionProperties): Promise<void> {
        return LocalFileAPI.post(collection.name, {action: 'unpublish'});
    }

    renameCollection(name: string, target: string): Promise<void> {
        return LocalFileAPI.move(name, target);
    }

    updateCollection(collection: Collection, vocabulary): Promise<void> {
        const metadataProperties = {
            [COMMENT_URI]: [{value: collection.description}]
        };
        return MetadataAPI.updateEntity(collection.iri, metadataProperties, vocabulary)
            .catch(handleHttpError("Failure while updating a collection"));
    }

    setAccessMode(name: string, mode: AccessMode): Promise<void> {
        return LocalFileAPI.post(name, {action: 'set_access_mode', mode});
    }

    setStatus(name: string, status: Status): Promise<void> {
        return LocalFileAPI.post(name, {action: 'set_status', status});
    }

    setPermission(name: string, principal: string, access: AccessLevel): Promise<void> {
        return LocalFileAPI.post(name, {action: 'set_permission', principal, access});
    }

    setOwnedBy(name: string, owner: string): Promise<void> {
        return LocalFileAPI.post(name, {action: 'set_owned_by', owner});
    }
}

export default new CollectionAPI();
