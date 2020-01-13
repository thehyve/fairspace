import axios from 'axios';
import Config from './Config';

export default function logout() {
    const performLocalLogout = () => {window.location.href = '/logout';};

    const {jupyterhub} = Config.get().urls;

    if (jupyterhub) {
        return axios.get(`${jupyterhub}/hub/logout`, {withCredentials: true})
            .catch(() => {})
            .then(performLocalLogout);
    }

    return Promise.resolve().then(performLocalLogout);
}
