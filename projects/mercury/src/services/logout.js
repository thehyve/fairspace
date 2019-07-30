import axios from 'axios';

import Config from "./Config/Config";

export default function logout() {
    const jupyterhubUrl = Config.get().urls.jupyterhub;
    const performLocalLogout = () => {window.location.href = Config.get().urls.logout;};

    if (jupyterhubUrl) {
        return axios.get(`${Config.get().urls.jupyterhub}/hub/logout`)
            .catch(() => {})
            .then(performLocalLogout);
    }

    return Promise.resolve().then(performLocalLogout);
}
