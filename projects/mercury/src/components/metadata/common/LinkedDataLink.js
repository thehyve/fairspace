import React from 'react';
import {Link} from "react-router-dom";
import * as PropTypes from "prop-types";

/**
 * Renders a link to a the editor for the given entity.
 *
 * The type of editor is specified by the editorPath parameter. If it points to /metadata
 * the metadata editor is opened, if it points to /vocabulary, the vocabulary editor is opened.
 *
 * @param props
 * @constructor
 */
const LinkedDataLink = ({uri, editorPath, children}) => <Link to={{pathname: editorPath, search: "?iri=" + encodeURIComponent(uri)}}>{children}</Link>;

LinkedDataLink.propTypes = {
    uri: PropTypes.string.isRequired,
    editorPath: PropTypes.string.isRequired,
    children: PropTypes.any
};

export default LinkedDataLink;
