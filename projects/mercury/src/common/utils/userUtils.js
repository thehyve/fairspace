export default function getDisplayName(user) {
    return (user && user.name) || '';
}

export const isDataSteward = (user) => ["coordinator", "datasteward"].includes(user.role);
export const isCoordinator = (user) => ["coordinator"].includes(user.role);
export const canWrite = (user) => ["coordinator", "datasteward", "write"].includes(user.role);
