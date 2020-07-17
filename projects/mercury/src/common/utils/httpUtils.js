/**
 * This method returns a function that handles HTTP error scenarios
 *      In case of a HTTP status 401, the user will be redirected to the login page
 *      In case of any other response, a promise rejection with the reason of the error is returned.
 *
 * @param providedMessage   If the backend does not provide an error message, this message will be given in the Error
 * @returns {Function}
 */
import ErrorDialog from "../components/ErrorDialog";
import {AxiosError} from 'axios';

export const handleAuthError = (status) => {
    switch (status) {
        case 401:
            ErrorDialog.showError(null, 'Your session has expired. Please log in again.',
                null,
                () => window.location.assign(`/login?redirectUrl=${encodeURI(window.location.href)}`));
            break;
        case 403:
            ErrorDialog.showError(null, 'You have no access to this resource. Ask your administrator to grant you access.',
                null,
                () => window.location.assign('/workspaces'));
            break;
        default:
    }
};

export function handleHttpError(providedMessage) {
    return (e: Error | AxiosError) => {
        if (!e || !e.response) {
            throw e;
        }
        const {response: {status, data, message}} = e;

        switch (status) {
            case 401:
            case 403:
                handleAuthError(status);
                break;
            default: {
                if (status === 400 && data && data.details) {
                    // eslint-disable-next-line no-throw-literal
                    throw {details: data.details, message: data.message};
                }

                // If a message was provided by the backend, provide it to the calling party
                const defaultMessage = `${providedMessage} ${message || ''}`.trim();
                throw Error((data && data.message) || defaultMessage);
            }
        }
    };
}

/**
 * This function will extract the data property of the axios response if the content-type in the headers contains 'json'
 * otherwise it will throw an error
 * @param {{headers, data}}
 */
export function extractJsonData({headers, data}) {
    const contentType = headers ? headers['content-type'] : '';
    const isJson = contentType && contentType.includes('json');

    if (isJson) {
        return data;
    }

    throw Error(`Unable to parse response${contentType ? ', content type: ' + contentType : ''}`);
}
