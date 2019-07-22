import Config from "./Config/Config";
import failOnHttpError from "../utils/httpUtils";
import {createMetadataIri} from "../utils/linkeddata/metadataUtils";

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
}

export default new AccountAPI();
