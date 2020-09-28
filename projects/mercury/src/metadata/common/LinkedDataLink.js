import React, {useContext} from 'react';
import {Link as RouterLink} from "react-router-dom";
import * as PropTypes from "prop-types";
import {Link} from '@material-ui/core';
import {METADATA_PATH} from "../../constants";
import UserContext from '../../users/UserContext';

/**
 * Renders a link to the metadata editor.
 *
 * @param props
 * @constructor
 */
const LinkedDataLink = ({uri, children}) => {
    const {currentUser} = useContext(UserContext);
    if (currentUser && currentUser.canViewPublicMetadata) {
        return (
            <Link
                component={RouterLink}
                to={{pathname: METADATA_PATH, search: "?iri=" + encodeURIComponent(uri)}}
                color="inherit"
                underline="hover"
            >
                {children}
            </Link>
        );
    }
    return children;
};

LinkedDataLink.propTypes = {
    uri: PropTypes.string.isRequired,
    children: PropTypes.any.isRequired
};

export default LinkedDataLink;
