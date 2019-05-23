import React from 'react';
import PropTypes from "prop-types";
import {ListItem} from '@material-ui/core';
import List from "@material-ui/core/List";

/* eslint-disable no-underscore-dangle */
/**
 * Renders the highlighted matches for the given hit
 * @param highlights
 * @returns {*}
 * @constructor
 */
const SearchResultHighlights = ({highlights}) => highlights && (
    <List>{
        highlights
            .map(([key, value]) => (
                <ListItem key={key}>
                    <u>{key}</u>: <span dangerouslySetInnerHTML={{__html: value}} />
                </ListItem>
            ))
    }
    </List>
);


SearchResultHighlights.propTypes = {
    highlights: PropTypes.array
};

export default SearchResultHighlights;
