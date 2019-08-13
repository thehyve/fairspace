import axios from 'axios';

import Config from "./Config/Config";
import {handleHttpError, extractJsonData} from "../utils/httpUtils";
import {createMetadataIri} from "../utils/linkeddata/metadataUtils";

class AccountAPI {
    getUser() {
        return axios.get(Config.get().urls.userInfo)
            .catch(handleHttpError("Failure when retrieving username"))
            .then(extractJsonData)
            .then(user => ({...user, iri: createMetadataIri(user.id)}));
    }
}

export default new AccountAPI();
