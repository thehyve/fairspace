import React from 'react';
import PropTypes from "prop-types";
import {List, ListItem, ListItemText} from '@material-ui/core';
import _ from 'lodash';

/* eslint-disable no-underscore-dangle */
/**
 * Renders the highlighted matches for the given hit
 * @param highlights
 * @returns {*}
 * @constructor
 */
const SearchResultHighlights = ({highlights}) => highlights && (
    <List dense>
        {
            highlights
                .map(([key, value]) => (
                    <ListItem key={key} dense disableGutters>
                        <ListItemText
                            primary={_.upperFirst(key)}
                            secondary={<span dangerouslySetInnerHTML={{__html: value}} />}
                        />
                    </ListItem>
                ))
        }
    </List>
);


SearchResultHighlights.propTypes = {
    highlights: PropTypes.array
};

export default SearchResultHighlights;
