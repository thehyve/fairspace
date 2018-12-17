const MANAGE = 'Manage';
const WRITE = 'Write';
const READ = 'Read';

export default {
    canRead: (collection) => {
        switch (collection.access) {
            case MANAGE:
            case WRITE:
            case READ:
                return true;
            default:
                return false;
        }
    },

    canWrite: (collection) => {
        switch (collection.access) {
            case MANAGE:
            case WRITE:
                return true;
            default:
                return false;
        }
    },

    canManage: (collection) => {
        switch (collection.access) {
            case MANAGE:
                return true;
            default:
                return false;
        }
    }
};
