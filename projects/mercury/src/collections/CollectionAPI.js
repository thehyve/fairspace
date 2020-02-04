// @flow
import axios from 'axios';
import {extractJsonData, handleHttpError} from '../common';


const collectionsUrl = "collections/";
const headers = {'Content-Type': 'application/json'};

export type CollectionProperties = {|
    name: string;
    description: string;
    connectionString: string;
    location: string;
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
|};

export type Collection = Resource & CollectionProperties & CollectionType & CollectionPermissions & CollectionAuditInfo;


class CollectionAPI {
    getCollections(): Promise<Collection[]> {
        return axios.get(collectionsUrl, {headers: {Accept: 'application/json'}})
            .catch(handleHttpError("Failure when retrieving a list of collections"))
            .then(extractJsonData);
    }

    addCollection(collection: CollectionProperties): Promise<void> {
        return axios.put(
            collectionsUrl,
            JSON.stringify(collection),
            {headers}
        ).catch(handleHttpError("Failure while saving a collection"));
    }

    updateCollection(collection: Collection): Promise<void> {
        return axios.patch(
            collectionsUrl,
            JSON.stringify(collection),
            {headers}
        ).catch(handleHttpError("Failure while updating a collection"));
    }

    deleteCollection(collection: Resource): Promise<void> {
        return axios.delete(
            `${collectionsUrl}?iri=${encodeURIComponent(collection.iri)}`,
            {headers}
        ).catch(handleHttpError("Failure while deleting collection"));
    }
}

export default new CollectionAPI();
