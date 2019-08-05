/**
 * This method returns a function that handles HTTP error scenarios
 *      In case of a HTTP status 401, the user will be redirected to the login page
 *      In case of any other response, a promise rejection with the reason of the error is returned.
 *
 * @param providedMessage   If the backend does not provide an error message, this message will be given in the Error
 * @returns {Function}
 */
export function handleHttpError(providedMessage) {
    return ({response}) => {
        const {status, data: {details, message}} = response;

        switch (status) {
            case 401:
                window.location.assign(`/login?redirectUrl=${encodeURI(window.location.href)}`);

                // eslint-disable-next-line no-throw-literal
                throw {
                    message: 'Your session has expired. Please log in again',
                    redirecting: true
                };
            default: {
                if (status === 400 && details) {
                    // eslint-disable-next-line no-throw-literal
                    throw {details, message};
                }

                // If a message was provided by the backend, provide it to the calling party
                const defaultMessage = `${providedMessage} ${response.message || ''}`.trim();
                throw Error(message || defaultMessage);
            }
        }
    };
}
