// @flow
import axios, {AxiosRequestConfig} from 'axios';


export const currentWorkspace = () => {
    const segments = window.location.pathname.split('/');
    return ((segments.length > 2 && segments[0] === '' && segments[1] === 'workspaces') && segments[2]) || '';
};

export const workspacePrefix = (workspace: string = currentWorkspace()) => (workspace ? `/workspaces/${workspace}` : '');

axios.interceptors.request.use((config: AxiosRequestConfig) => {
    if (!config.url.startsWith('/')) {
        const workspace = currentWorkspace();
        if (workspace) {
            config.baseURL = `/api/v1/workspaces/${workspace}/`;
        }
    }
    return config;
}, Promise.reject);
