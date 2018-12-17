import Config from "../Config/Config";

export function logout() {
    fetch(`${Config.get().urls.jupyter}/hub/logout`, {credentials: 'include'})
        .catch((ignore) => {})
        .then(() => window.location.href = Config.get().urls.logout);
}
