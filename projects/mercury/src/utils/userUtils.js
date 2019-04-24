export default function getDisplayName(user) {
    if (!user) {
        return '';
    }

    const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '';
    return fullName || user.firstName || user.lastName || user.email || user.username || user.id;
}

export const isDataSteward = (authorizations, config) => authorizations.includes(config.roles.dataSteward);
export const isCoordinator = (authorizations, config) => authorizations.includes(config.roles.coordinator);
