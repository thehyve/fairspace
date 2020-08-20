// @flow
import {handleHttpError} from '../common/utils/httpUtils';
import FileAPI from "../file/FileAPI";
import MetadataAPI from "../metadata/common/MetadataAPI";
import {mapCollectionNameAndDescriptionToMetadata, mapFilePropertiesToCollection} from "./collectionUtils";
import type {User} from "../users/UsersAPI";

const rootUrl = '';

export type AccessLevel = 'None' | 'List' | 'Read' | 'Write' | 'Manage';
export const accessLevels: AccessLevel[] = ['None', 'List', 'Read', 'Write', 'Manage'];
export type AccessMode = 'Restricted' | 'MetadataPublished' | 'DataPublished';
export const accessModes: AccessMode[] = ['Restricted', 'MetadataPublished', 'DataPublished'];
export type Status = 'Active' | 'Archived' | 'Closed';
export const statuses: Status[] = ['Active', 'Archived', 'Closed'];

export type Permission = {
    iri: string; // iri
    access: AccessLevel;
}

export type CollectionProperties = {|
    name: string;
    description: string;
    location: string;
    ownerWorkspace: string;
|};

export type CollectionType = {|
    type?: string;
|};

export type CollectionPermissions = {|
    access?: AccessLevel;
    userPermissions: Permission[];
    workspacePermissions: Permission[];
    canRead: boolean;
    canWrite: boolean;
    canManage: boolean;
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
        return FileAPI.stat(name).then(mapFilePropertiesToCollection);
    }

    getCollections(currentUser: User, showDeleted = false): Promise<Collection[]> {
        return FileAPI.list(rootUrl, showDeleted)
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
        return FileAPI.createDirectory(collection.location, options)
            .then(() => this.getCollectionProperties(collection.location))
            .then((properties) => {
                collection.iri = properties.iri;
                return this.updateCollection(collection, vocabulary);
            });
    }

    deleteCollection(collection: CollectionProperties, showDeleted = false): Promise<void> {
        return FileAPI.delete(collection.location, showDeleted)
            .catch(handleHttpError("Failure while deleting collection"));
    }

    undeleteCollection(collection: CollectionProperties): Promise<void> {
        return FileAPI.undelete(collection.location)
            .catch(handleHttpError("Failure while undeleting collection"));
    }

    relocateCollection(oldLocation: string, newLocation: string): Promise<void> {
        return FileAPI.move(oldLocation, newLocation)
            .catch(handleHttpError("Failure while relocating collection"));
    }

    updateCollection(collection: Collection, vocabulary): Promise<void> {
        const metadataProperties = mapCollectionNameAndDescriptionToMetadata(collection.name, collection.description);
        return MetadataAPI.updateEntity(collection.iri, metadataProperties, vocabulary)
            .catch(e => {
                console.error(e);
                throw Error("Failure while updating a collection");
            });
    }

    setAccessMode(location: string, mode: AccessMode) {
        return FileAPI.post(location, {action: 'set_access_mode', mode});
    }

    setStatus(location: string, status: Status) {
        return FileAPI.post(location, {action: 'set_status', status});
    }

    setPermission(location: string, principal: string, access: AccessLevel) {
        return FileAPI.post(location, {action: 'set_permission', principal, access});
    }

    setOwnedBy(location: string, owner: string) {
        return FileAPI.post(location, {action: 'set_owned_by', owner});
    }
}

export default new CollectionAPI();
