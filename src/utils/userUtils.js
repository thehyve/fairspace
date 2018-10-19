/**
 * Composed fullname of a user
 * @param user
 * @returns {string}
 *  - full name if there are first name and last name
 *  - first name or last name if only one of them exist
 *  - email when no names at all
 *  - username when no names and email
 *  - id when no names, email and username
 */
import {findById} from "./arrayutils";

export const getDisplayName = user => {
    if(!user) {
        return '';
    }
    const hasFirstName = user.hasOwnProperty('firstName') && user.firstName;
    const hasLastName = user.hasOwnProperty('lastName') && user.lastName;
    const hasFullName = hasFirstName && hasLastName && `${hasFirstName} ${hasLastName}`;
    const hasEmail = user.hasOwnProperty('email') && user.email;
    const hasUsername = user.hasOwnProperty('username') && user.username;
    const hasId = user.hasOwnProperty('id') && user.id;

    return (hasFullName ? hasFullName : hasFirstName || hasLastName) || hasEmail || hasUsername || hasId;
};

/**
 *
 * @param collections
 * @param users
 * @param userProp
 */
export const getUsers = (collections, users, userProp) => {
    if (collections && users && userProp) {
        collections.map(c => c.user = findById(users, c[userProp]));
    }
    return collections;
};
