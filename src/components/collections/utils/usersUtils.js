/**
 * Get user by user id
 * @param users
 * @param userId
 */
export const getUserById = (users, userId) => {
    return users.find(user => user.id === userId);
};

/**
 * Composed fullname of a user
 * @param user
 * @returns {string}
 */
export const getFullname = user => {
    const hasProperties =  user.hasOwnProperty('firstName') && user.hasOwnProperty('lastName');
    return hasProperties && `${user.firstName} ${user.lastName}`;
};
