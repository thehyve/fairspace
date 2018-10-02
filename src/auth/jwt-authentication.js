let Errors = require("webdav-server").v2.Errors;

const defaultUser = {
    uid: '',
    username: '',
    isAdministrator: false,
    isDefaultUser: true
};

module.exports = {
    askForAuthentication: () => ({}),
    getUser: (ctx, callback) => {
        let authHeader = ctx.headers.find('Authorization');

        if (!authHeader) {
            callback(null, defaultUser);
        } else if (authHeader.startsWith('Bearer ')) {
            let token = authHeader.split(' ')[1];
            let user = {
                uid: token,
                username: token,
                password: token,
                isAdministrator: false,
                isDefaultUser: false
            };

            callback(null, user);
        } else {
            callback(Errors.WrongHeaderFormat);
        }
    }
};
