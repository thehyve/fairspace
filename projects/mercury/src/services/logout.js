import Config from "./Config/Config";

export default function logout() {
    const jupyterhubUrl = Config.get().urls.jupyterhub;
    const performLocalLogout = () => { window.location.href = Config.get().urls.logout; };

    if(jupyterhubUrl) {
        fetch(`${Config.get().urls.jupyterhub}/hub/logout`, {credentials: 'include'})
            .catch(() => {})
            .then(performLocalLogout);
    } else {
        return Promise.resolve().then(performLocalLogout);
    }
}
