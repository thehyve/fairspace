import axios from 'axios';


export const currentProject = () => {
    const segments = window.location.pathname.split('/');
    return ((segments.length > 2 && segments[0] === '' && segments[1] === 'projects') && segments[2]) || undefined;
};

export const projectPrefix = () => (currentProject() && `/projects/${currentProject()}`) || '';

axios.interceptors.request.use((config) => {
    config.params = {project: currentProject(), ...(config.params || {})};
    return config;
}, Promise.reject);
