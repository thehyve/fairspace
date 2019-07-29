import React, {useContext} from 'react';
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import LoadingInlay from './LoadingInlay';
import UserContext from "../../UserContext";

/**
 * This component performs an authorization check for the current user
 * and renders only if the check is positive
 *
 * @see config.json
 */
export const AuthorizationCheck = props => {
    /**
     * Check whether the given array contains the authorization that is asked for
     * @param data
     * @returns {boolean}
     */
    function hasAuthorization() {
        const {authorizations, authorization} = props;

        if (Array.isArray(authorizations)) {
            // If no authorization is given as property, the only check is for a status 200 response
            // If the authorization is specified, we want the array to actually contain the authorization
            if (!authorization || authorizations.includes(authorization)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Renders an error message
     * @returns {*}
     */
    function renderError() {
        // An error occurred or no authorization
        const showError = props.transformError || (error => error);

        return showError(
            <div style={{minHeight: 300}}>
                <Typography
                    variant="h5"
                    component="h2"
                >
                    Error
                </Typography>
                <Typography
                    component="p"
                >
                    You do not have sufficient privileges to access this function. Please contact an administrator.
                </Typography>
            </div>
        );
    }

    if (props.pending) {
        return <LoadingInlay />;
    } if (props.error || !hasAuthorization()) {
        return renderError();
    }
    return props.children;
};

AuthorizationCheck.propTypes = {
    /**
     * List of authorization for the current user
     */
    authorizations: PropTypes.arrayOf(PropTypes.string),

    /**
     * Optional value to indicate the actual authorization to check for. If not specified, the check will only
     * verify whether the server responds with a success message on the authorization endpoint.
     */
    authorization: PropTypes.string,

    /**
     * Optional transformation method to convert the error message into correct HTML. Defaults to identity
     */
    transformError: PropTypes.func
};

const ContextualAuthorizationCheck = props => {
    const {currentUser, currentUserLoading, currentUserError} = useContext(UserContext);
    return (
        <AuthorizationCheck
            authorizations={currentUser.authorizations}
            pending={currentUserLoading}
            error={currentUserError}
            {...props}
        />
    );
};

export default ContextualAuthorizationCheck;
