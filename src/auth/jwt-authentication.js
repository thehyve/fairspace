let Errors = require("webdav-server").v2.Errors;

const defaultUser = {
    uid: '',
    username: '',
    isAdministrator: false,
    isDefaultUser: true
};

module.exports = {
    askForAuthentication: () => ({'WWW-Authenticate': 'Basic realm=\"realm\"'}),
    getUser: (ctx, callback) => {
        let authHeader = ctx.headers.find('Authorization');

        if (!authHeader) {
            callback(null, defaultUser);
            return;
        }

        let token;

        if (authHeader.startsWith('Basic ')) {
            // take JWT from the password field
            token = Buffer.from(/^Basic \s*([a-zA-Z0-9]+=*)\s*$/.exec(authHeader)[1], 'base64').toString().split(':', 2)[1];
        } else if (authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            callback(Errors.WrongHeaderFormat);
            return;
        }

        let user = {
            uid: token,
            username: token,
            password: token,
            isAdministrator: false,
            isDefaultUser: false
        };

        callback(null, user);
    }
};
