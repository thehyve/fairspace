import React, {useState} from 'react';
import {Card, CardContent, CardHeader, Collapse, IconButton} from '@mui/material';
import classnames from 'classnames';
import withStyles from '@mui/styles/withStyles';
import {Clear, ExpandMore} from '@mui/icons-material';
import type {ValueType} from './MetadataViewAPI';
import TextSelectionFacet from './facets/TextSelectionFacet';
import DateSelectionFacet from './facets/DateSelectionFacet';
import NumericalRangeSelectionFacet from './facets/NumericalRangeSelectionFacet';
import BooleanSelectionFacet from './facets/BooleanSelectionFacet';

import styles from './MetadataViewFacetFactory.styles';

export type Option = {
    value: string,
    label: string,
    access?: string
};

export type MetadataViewFacetProperties = {
    title: string,
    options: Option[],
    type: ValueType,
    onChange: (string[]) => void,
    extraClasses?: string,
    classes?: any,
    activeFilterValues: any[],
    clearFilter: () => {}
};

const getFacet = (props: MetadataViewFacetProperties) => {
    switch (props.type) {
        case 'Identifier':
        case 'Term':
        case 'TermSet':
            return <TextSelectionFacet {...props} />;
        case 'Number':
            return <NumericalRangeSelectionFacet {...props} />;
        case 'Date':
            return <DateSelectionFacet {...props} />;
        case 'Boolean':
            return <BooleanSelectionFacet {...props} />;
        default:
            return <></>;
    }
};

const Facet = (props: MetadataViewFacetProperties) => {
    const {clearFilter, title, activeFilterValues = [], extraClasses, classes} = props;
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => setExpanded(!expanded);

    const cardHeaderAction = (
        <IconButton
            className={classnames(
                classes.expand,
                {
                    [classes.expandOpen]: expanded
                },
                classes.headerIcon
            )}
            onClick={toggleExpand}
            aria-expanded={expanded}
            aria-label="Show more"
            size="medium"
        >
            <ExpandMore />
        </IconButton>
    );

    const clearFiltersAction = activeFilterValues.length > 0 && (
        <IconButton onClick={clearFilter} aria-label="Clear" className={classes.headerIcon} size="medium">
            <Clear fontSize="small" color="primary.contrastText" />
        </IconButton>
    );

    return (
        <Card className={`${classes.root} ${extraClasses}`} variant="outlined">
            <CardHeader
                className={classes.title}
                titleTypographyProps={{color: 'textSecondary', variant: 'body1'}}
                title={title}
                avatar={cardHeaderAction}
                action={clearFiltersAction}
            />
            <Collapse in={expanded} timeout="auto">
                <CardContent className={classes.content}>{getFacet({...props, classes})}</CardContent>
            </Collapse>
        </Card>
    );
};

export default withStyles(styles)(Facet);
