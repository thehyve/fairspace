import React from 'react';
import {Link} from "react-router-dom";
import * as PropTypes from "prop-types";

/**
 * Renders a link to a metadata entity
 *
 * If the uri points to an entity within this workspace, the link is resolved
 * using react-router. Otherwise, a normal link will be generated
 * @param props
 * @constructor
 */
const LinkedDataLink = ({uri, children}) => {
    try {
        const {hostname, pathname, search, hash} = new URL(uri);
        const uriIsSameOrigin = hostname === window.location.hostname;

        return (uriIsSameOrigin
            ? <Link to={{pathname, search, hash}}>{children}</Link>
            : <a href={uri}>{children}</a>
        );
    } catch (e) {
        console.warn("Invalid URL passed to LinkedDataLink component", uri);
        return <a href={uri}>{children}</a>;
    }
};

LinkedDataLink.propTypes = {
    uri: PropTypes.string.isRequired,
    children: PropTypes.any
};

export default LinkedDataLink;
