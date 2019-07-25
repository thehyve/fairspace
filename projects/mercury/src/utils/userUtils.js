export default function getDisplayName(user) {
    return (user && user.name) || '';
}

export const isDataSteward = (authorizations, config) => authorizations && authorizations.includes(config.roles.dataSteward);
export const isCoordinator = (authorizations, config) => authorizations && authorizations.includes(config.roles.coordinator);
