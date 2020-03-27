export function getDisplayName(user) {
    return (user && user.name) || '';
}

export const isAdmin = (user) => user && user.admin;
export const isDataSteward = (user) => isAdmin(user);
