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
const LinkedDataLink = (props) => (
    props.uri.startsWith(`${window.location.origin}/`)
        ? <Link to={props.uri.replace(window.location.origin, '')}>{props.children}</Link>
        : <a href={props.uri}>{props.children}</a>
);

LinkedDataLink.propTypes = {
    uri: PropTypes.string.isRequired,
    children: PropTypes.any
};

export default LinkedDataLink;
