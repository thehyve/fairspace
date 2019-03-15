import React from 'react';
import {ListItem} from '@material-ui/core';
import * as PropTypes from "prop-types";
import List from "@material-ui/core/List";

/* eslint-disable no-underscore-dangle */
/**
 * Renders the highlighted matches for the given hit
 * @param highlights
 * @returns {*}
 * @constructor
 */
const SearchResultHighlights = ({highlights}) => {
    if (!highlights) {
        return '';
    }

    // Only show highlights for which the key does not end in 'keyword'
    // as these are mostly duplicates of the fields themselves
    return (
        <List>{
            Object.keys(highlights)
                .filter(key => !key.endsWith('.keyword'))
                .map(key => (
                    <ListItem key={key}>
                        <u>{key}</u>: <span dangerouslySetInnerHTML={{__html: highlights[key]}} />
                    </ListItem>
                ))
        }
        </List>
    );
};

SearchResultHighlights.propTypes = {
    highlights: PropTypes.object
};

export default SearchResultHighlights;
