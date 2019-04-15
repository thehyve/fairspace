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
    const {origin, port} = new URL(window.location.origin);
    const originMinusPort = port ? origin.replace(':' + port, '') : origin;

    return (
        uri.startsWith(`${originMinusPort}/`)
            ? <Link to={uri.replace(originMinusPort, '')}>{children}</Link>
            : <a href={uri}>{children}</a>
    );
};

LinkedDataLink.propTypes = {
    uri: PropTypes.string.isRequired,
    children: PropTypes.any
};

export default LinkedDataLink;
