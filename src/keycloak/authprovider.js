import {AUTH_CHECK, AUTH_ERROR, AUTH_LOGIN, AUTH_LOGOUT} from 'react-admin';

export default (adapter) => {
    return (type, params) => {
        if (type === AUTH_LOGIN) {
            adapter.login();
        }
        if (type === AUTH_LOGOUT) {
            return adapter.logout();
        }

        if (type === AUTH_ERROR) {
            const status = params.status;
            if (status === 401 || status === 403) {
                return adapter.refresh();
            }
            return Promise.resolve();
        }

        if (type === AUTH_CHECK) {
            return adapter.hasToken();
        }
        return Promise.resolve();
    }
}