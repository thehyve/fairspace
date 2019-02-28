function failOnHttpError(message) {
    return (response) => {
        if (response && !response.ok) {
            switch (response.status) {
                case 401:
                    window.location.assign(`/login?redirectUrl=${encodeURI(window.location.href)}`);
                    break;
                default:
                    throw Error(`${message} ${response.error || ''}`);
            }
        }
        return response;
    };
}

export default failOnHttpError;
