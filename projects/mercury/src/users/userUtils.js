export function getDisplayName(user) {
    return (user && user.name) || '';
}

export function getEmail(user) {
    return (user && user.email) || '';
}

export const isAdmin = (user) => user && user.admin;
export const isDataSteward = (user) => isAdmin(user);
