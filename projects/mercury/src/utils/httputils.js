import Config from "../services/Config/Config";

export function failOnHttpError(message) {
    return response => {
        if(!response.ok) {
            switch (response.status) {
                case 401:
                    window.location.pathname = Config.get().urls.login;
                    break;
                default:
                    throw Error(message + ' ' + response.error);
            }
        }
        return response;
    }
}
