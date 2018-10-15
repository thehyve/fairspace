import Config from "../Config/Config";
import {failOnHttpError} from "../../utils/httputils";

class AccountAPI {
    getUser() {
        return fetch(Config.get().urls.userInfo, {
            method: 'GET',
            credentials: 'same-origin'
        })
        .then(failOnHttpError("Failure when retrieving username"))
        .then(response => response.json())
    }

    getAuthorizations() {
        return fetch(Config.get().urls.authorizations, {
            method: 'GET',
            credentials: 'same-origin'
        })
            .then(failOnHttpError("Failure when retrieving authorizations"))
            .then(response => response.json())
    }
}

export default new AccountAPI();
