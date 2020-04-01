import {logoutUser} from "../../users/UsersAPI";

export default function logout() {
    const performLocalLogout = () => {window.location.href = '/logout';};

    // TODO: Fix me
    // if (jupyterhub) {
    //     return axios.get(`${jupyterhub}/hub/logout`, {withCredentials: true})
    //         .catch(() => {})
    //         .then(performLocalLogout);
    // }

    return logoutUser().then(performLocalLogout);
}
