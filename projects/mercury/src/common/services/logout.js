import axios from 'axios';

export default function logout({logoutUrl, jupyterhubUrl}) {
    const performLocalLogout = () => {window.location.href = logoutUrl;};

    if (jupyterhubUrl) {
        return axios.get(`${jupyterhubUrl}/hub/logout`, {withCredentials: true})
            .catch(() => {})
            .then(performLocalLogout);
    }

    return Promise.resolve().then(performLocalLogout);
}
