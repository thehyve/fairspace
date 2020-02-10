export default function getDisplayName(user) {
    return (user && user.name) || '';
}

export const isDataSteward = (authorizations) => authorizations && authorizations.includes('DataSteward');
export const isCoordinator = (authorizations) => authorizations && authorizations.includes('Coordinator');
export const canWrite = (authorizations) => authorizations && authorizations.includes('CanWrite');
