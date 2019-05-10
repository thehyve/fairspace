/**
 * This method returns a function that handles HTTP error scenarios
 *      In case of succesful HTTP call, the response is propagated
 *      In case of a HTTP status 401, the user will be redirected to the login page
 *      In case of any other response, a promise rejection with the reason of the error is returned.
 * @param providedMessage   If the backend does not provide an error message, this message will be given in the Error
 * @returns {Function}
 */
function failOnHttpError(providedMessage) {
    return (response) => {
        if (response && !response.ok) {
            const defaultMessage = `${providedMessage} ${response.error || ''}`;
            switch (response.status) {
                case 401:
                    window.location.assign(`/login?redirectUrl=${encodeURI(window.location.href)}`);
                    break;
                default:
                    return response.json()
                        .then(body => {
                            if (response.status === 400 && body.details) {
                                // eslint-disable-next-line no-throw-literal
                                throw {
                                    details: body.details,
                                    message: body.message
                                };
                            }

                            // If a message was provided by the backend, provide it to the calling party
                            throw Error(body && body.message ? body.message : defaultMessage);
                        });
            }
        }
        return response;
    };
}

export default failOnHttpError;
