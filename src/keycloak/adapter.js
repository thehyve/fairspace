import Keycloak from 'keycloak-js';
import adapterAuthProvider from './authprovider'

export default class KeycloakAdapter {
    constructor() {
        // Setup keycloak authentication
        this.kc = Keycloak();
    }

    init() {
        const token = localStorage.getItem('kc_token');

        const refreshToken = localStorage.getItem('kc_refreshToken');

        return this.kc
            .init({onLoad: 'login-required', token: token, refreshToken: refreshToken, checkLoginIframe: false})
            .then(authenticated => {
                if (authenticated) {
                    this.updateLocalStorage();
                }
            });

    }

    updateLocalStorage() {
        localStorage.setItem('kc_token', this.kc.token);
        localStorage.setItem('kc_refreshToken', this.kc.refreshToken);
    }

    createAuthProvider() {
        return adapterAuthProvider(this)
    }

    login() {
        return this.kc.login();
    }

    logout() {
        localStorage.removeItem('kc_token');
        localStorage.removeItem('kc_refreshToken');
        this.kc.logout();
        return Promise.resolve();
    }

    refresh() {
        return this.kc.updateToken(5)
            .then(refreshed => {
                if (refreshed) {
                    this.updateLocalStorage()
                }
                return Promise.resolve()
            })
            .catch(() => {
                this.kc.login();
            })
    }

    isAuthenticated() {
        return this.kc.authenticated;
    }

    hasToken() {
        return !!localStorage.getItem('kc_token');
    }

    getToken() {
        return localStorage.getItem('kc_token');
    }
}