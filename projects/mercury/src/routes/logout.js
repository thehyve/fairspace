import {logoutUser} from "../users/UsersAPI";

export default function logout() {
    const navigateToRoot = () => {window.location.href = '/';};

    return logoutUser().then(() => {
        sessionStorage.clear();
        navigateToRoot();
    });
}
