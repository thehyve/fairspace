// @ts-nocheck
import React from "react";
import PropTypes from "prop-types";
import {List, ListItem, Typography} from "@mui/material";
import _ from "lodash";
import {SHACL_NAME, SHACL_PATH, SHACL_PROPERTY} from "../constants";

const labelForKey = (key, typeShape) => {
    if (!typeShape) {
        return _.upperFirst(key);
    }

    const property = typeShape[SHACL_PROPERTY].find(prop => {
        const path = prop[SHACL_PATH];
        return path && path.length > 0 && path[0]['@id'].endsWith(key);
    });
    return property ? property[SHACL_NAME][0]['@value'] : _.upperFirst(key);
};

// eslint-disable-next-line no-unused-vars
const filterProperties = ([key, value]) => !['iri', 'type', 'contains', 'label', 'comment'].includes(key);

/**
 * Renders the highlighted matches for the given hit
 * @param highlights
 * @returns {*}
 * @constructor
 */
const SearchResultHighlights = ({
    highlights,
    typeShape
}) => highlights && <List dense>
    {highlights.filter(filterProperties).map(([key, value]) => <ListItem key={key} dense disableGutters style={{
        display: 'inline-table'
    }}>
        <Typography variant="overline">
            {labelForKey(key, typeShape)}
        </Typography>
        <Typography variant="body1">
            <span dangerouslySetInnerHTML={{
                __html: value
            }} />
        </Typography>
    </ListItem>)}
</List>;

SearchResultHighlights.propTypes = {
    highlights: PropTypes.array,
    typeShape: PropTypes.any
};
export default SearchResultHighlights;