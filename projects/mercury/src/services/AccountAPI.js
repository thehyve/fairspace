import Config from "./Config/Config";
import failOnHttpError from "../utils/httpUtils";
import {createMetadataIri} from "../utils/metadataUtils";

class AccountAPI {
    getUser() {
        return fetch(Config.get().urls.userInfo, {
            method: 'GET',
            credentials: 'same-origin'
        })
            .then(failOnHttpError("Failure when retrieving username"))
            .then(response => response.json())
            .then(user => ({...user, iri: createMetadataIri(user.id)}));
    }

    getAuthorizations() {
        return fetch(Config.get().urls.authorizations, {
            method: 'GET',
            credentials: 'same-origin'
        })
            .then(failOnHttpError("Failure when retrieving authorizations"))
            .then(response => response.json());
    }
}

export default new AccountAPI();
