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
        let payload = jwt.decode(token);
        let userId = payload.sub;

        if (!userId) {
            callback(Errors.AuthenticationPropertyMissing);
            return;
        }

        let user = {
            uid: userId,
            isAdministrator: false,
            isDefaultUser: false,
            username: userId
        };

        callback(null, user);
    }
};
