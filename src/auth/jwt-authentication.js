let Errors = require("webdav-server").v2.Errors;
let jwt = require('jsonwebtoken');

module.exports = {
    askForAuthentication: () => [],
    getUser: (ctx, callback) => {
        let authHeader = ctx.headers.find('Authorization');

        if (!authHeader) {
            callback(Errors.MissingAuthorisationHeader);
            return;
        }

        if (!authHeader.startsWith('Bearer ')) {
            callback(Errors.WrongHeaderFormat);
            return;
        }

        let token = authHeader.split(' ')[1];
        let decoded = jwt.decode(token, {complete: true});
        let username = decoded.payload.sub;

        if (!username) {
            callback(Errors.AuthenticationPropertyMissing);
            return;
        }

        let user = {
            uid: username,
            isAdministrator: false,
            isDefaultUser: false,
            username: username
        };

        callback(null, user);
    }
};
