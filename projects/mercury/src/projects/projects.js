// @flow
import axios, {AxiosRequestConfig} from 'axios';


export const currentProject = () => {
    const segments = window.location.pathname.split('/');
    return ((segments.length > 2 && segments[0] === '' && segments[1] === 'projects') && segments[2]) || '';
};

export const projectPrefix = () => (currentProject() ? `/projects/${currentProject()}` : '');

axios.interceptors.request.use((config: AxiosRequestConfig) => {
    if (!config.url.startsWith('/')) {
        const project = currentProject();
        if (project) {
            config.baseURL = `/api/v1/projects/${project}/`;
        }
    }
    return config;
}, Promise.reject);
