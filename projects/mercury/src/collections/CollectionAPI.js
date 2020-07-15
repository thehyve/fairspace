// @flow
import {handleHttpError} from '../common/utils/httpUtils';
import FileAPI from "../file/FileAPI";
import {MetadataAPI} from "../metadata/common/LinkedDataAPI";
import {mapCollectionNameAndDescriptionToMetadata, mapFilePropertiesToCollection} from "./collectionUtils";
import PermissionAPI from "../permissions/PermissionAPI";
import type {User} from "../users/UsersAPI";

const rootUrl = "";

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
|};

export type Collection = Resource & CollectionProperties & CollectionType & CollectionPermissions & CollectionAuditInfo;

class CollectionAPI {
    getCollectionPermissions(iri: string, userIri: string): Promise<CollectionPermissions> {
        return PermissionAPI.getPermissions(iri).then(permissions => permissions.find(p => p.user === userIri));
    }

    getCollectionProperties(name: string): Promise<Collection> {
        return FileAPI.stat(name).then(mapFilePropertiesToCollection);
    }

    getCollections(currentUser: User, showDeleted = false): Promise<Collection[]> {
        if (currentUser.iri) {
            return FileAPI.list(rootUrl, showDeleted)
                .then(collections => Promise.all(collections.map(c => (
                    this.getCollectionProperties(c.basename)
                ))))
                .catch(handleHttpError("Failure when retrieving a list of collections"));
        }
        return Promise.resolve([]);
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
        return FileAPI.delete(collection.name, showDeleted)
            .catch(handleHttpError("Failure while deleting collection"));
    }

    undeleteCollection(collection: CollectionProperties): Promise<void> {
        return FileAPI.undelete(collection.name)
            .catch(handleHttpError("Failure while undeleting collection"));
    }

    relocateCollection(oldLocation: string, newLocation: string): Promise<void> {
        return FileAPI.move(oldLocation, newLocation)
            .catch(handleHttpError("Failure while relocating collection"));
    }

    updateCollection(collection: Collection, vocabulary): Promise<void> {
        const metadataProperties = mapCollectionNameAndDescriptionToMetadata(collection.name, collection.description);
        return MetadataAPI.updateEntity(collection.iri, metadataProperties, vocabulary)
            .catch(handleHttpError("Failure while updating a collection"));
    }
}

export default new CollectionAPI();
