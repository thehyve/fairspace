import React from 'react';
import {Link} from "react-router-dom";
import * as PropTypes from "prop-types";
import {METADATA_PATH} from "../../constants";

/**
 * Renders a link to the metadata editor.
 *
 * @param props
 * @constructor
 */
const LinkedDataLink = ({uri, children}) => <Link to={{pathname: METADATA_PATH, search: "?iri=" + encodeURIComponent(uri)}}>{children}</Link>;

LinkedDataLink.propTypes = {
    uri: PropTypes.string.isRequired,
    children: PropTypes.any
};

export default LinkedDataLink;
