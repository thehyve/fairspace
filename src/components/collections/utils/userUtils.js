/**
 * Composed fullname of a user
 * @param user
 * @returns {string}
 */
export const getFullname = user => {
    const hasProperties =  user && (user.hasOwnProperty('firstName') && user.hasOwnProperty('lastName'));
    return hasProperties ? `${user.firstName} ${user.lastName}` : '';
};
