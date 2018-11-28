export function failOnHttpError(message) {
    return response => {
        if(!response.ok) {
            switch (response.status) {
                case 401:
                    window.location.reload(true);
                    break;
                default:
                    throw Error(message + ' ' + response.error);
            }
        }
        return response;
    }
}
