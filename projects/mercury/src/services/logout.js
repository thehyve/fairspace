import Config from "./Config/Config";

export default function logout() {
    fetch(`${Config.get().urls.jupyter}/hub/logout`, {credentials: 'include'})
        .catch(() => {})
        .then(() => {window.location.href = Config.get().urls.logout;});
}
