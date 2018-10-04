import Config from "../../components/generic/Config/Config";
import {failOnHttpError} from "../../utils/httputils";

class UserAPI {
    static getConfig = {
        method: 'GET',
        headers: new Headers({'Accept': 'application/json'}),
        credentials: 'same-origin'
    };

    getUsers() {
        return fetch(Config.get().urls.users, UserAPI.getConfig)
            .then(failOnHttpError('Error while loading users'))
            .then(response => response.json())
    }
}

export default new UserAPI();
