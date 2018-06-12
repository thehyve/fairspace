import {AUTH_CHECK, AUTH_ERROR, AUTH_LOGIN, AUTH_LOGOUT} from 'react-admin';

export default (baseUrl = 'http://localhost:8080') => {
    return (type, params) => {
        if (type === AUTH_LOGIN) {
            console.log('Login');
            window.location.href = baseUrl + '/login';
        }
        if (type === AUTH_LOGOUT) {
            window.location.href = baseUrl + '/logout';
        }

        if (type === AUTH_ERROR) {
            const status = params.status;
            if (status === 401 || status === 403) {
                window.location.href = baseUrl + '/login';
                return Promise.reject();
            }
            return Promise.resolve();
        }

        if (type === AUTH_CHECK) {
            return true
        }
        return Promise.resolve();
    }
}