import React from 'react';
import PropTypes from "prop-types";
import Fetch from "../../backend/Fetch/Fetch";
import config from "../../config";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";

/**
 * This component performs an authorization check for the current user
 * and renders only if the check is positive
 *
 * @see config.json
 */
class AuthorizationCheck extends React.Component {
    static propTypes = {
        /**
         * Optional value to indicate the actual authorization to check for. If not specified, the check will only
         * verify whether the server responds with a success message on the authorization endpoint.
         */
        authorization: PropTypes.string,

        /**
         * Optional transformation method to convert the error message into correct HTML. Defaults to identity
         */
        transformError: PropTypes.func
    }

    constructor(props) {
        super(props);
        this.props = props;
    }

    hasAuthorization(data) {
        if (data && Array.isArray(data)) {
            // If no authorization is given as property, the only check is for a status 200 response
            // If the authorization is specified, we want the array to actually contain the authorization
            if (!this.props.authorization || data.includes(this.props.authorization)) {
                return true;
            }
        }

        return false;
    }

    handleFetchedData(fetch) {
        const {isFetching, data} = fetch;

        if (isFetching) {
            return <CircularProgress/>
        }

        if(this.hasAuthorization(data)) {
            return this.props.children;
        }

        // An error occurred or no authorization
        const showError = this.props.transformError ? this.props.transformError : (error) => error;

        return showError(<div>
            <Typography variant="headline" component="h2">
                Error
            </Typography>
            <Typography component="p">
                You do not have sufficient privileges to access this function. Please contact an
                administrator.
            </Typography>
        </div>)
    }

    render() {
        return (<Fetch url={config.urls.authorizations}>
                {this.handleFetchedData.bind(this)}
            </Fetch>)
    }
}

export default AuthorizationCheck;