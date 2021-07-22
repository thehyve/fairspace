export default function logout() {
    sessionStorage.clear();
    window.location.href = '/logout';
}
