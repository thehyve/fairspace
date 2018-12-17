export function failOnHttpError(message) {
    return (response) => {
        if (!response.ok) {
            switch (response.status) {
                case 401:
                    window.location.href = `/login?redirectUrl=${encodeURI(window.location.href)}`;
                    break;
                default:
                    throw Error(`${message} ${response.error}`);
            }
        }
        return response;
    };
}
