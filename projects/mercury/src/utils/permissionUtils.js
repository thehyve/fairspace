const MANAGE = 'Manage';
const WRITE = 'Write';
const READ = 'Read';

export default {
    canRead: (collection) => collection
        && (collection.access === MANAGE || collection.access === WRITE || collection.access === READ),

    canWrite: (collection) => collection
        && (collection.access === MANAGE || collection.access === WRITE),

    canManage: (collection) => collection && collection.access === MANAGE,
};
