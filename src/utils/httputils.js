export function failOnHttpError(message) {
    return response => {
        if(!response.ok) {
            throw Error(message + ' ' + response.error);
        }
        return response;
    }
}

