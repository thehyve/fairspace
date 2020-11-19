import React from 'react';

import {Card, CardContent} from "@material-ui/core";

import {makeStyles} from "@material-ui/core/styles";
import type {ValueType} from "./MetadataViewAPI";
import TextSelectionFacet from "./facets/TextSelectionFacet";
import DateSelectionFacet from "./facets/DateSelectionFacet";
import NumericalRangeSelectionFacet from "./facets/NumericalRangeSelectionFacet";

type Option = {
    label: string;
    iri: string;
}

export type MetadataViewFacetProperties = {
    title: string;
    options: Option[];
    type: ValueType;
    multiple?: boolean;
    onChange: (string[]) => void;
    extraClasses?: string;
    classes?: any;
};

const useStyles = makeStyles({
    root: {
        width: 250,
        height: 215,
        maxHeight: 215,
        overflowY: 'auto',
        boxShadow: '0px 1px 1px -1px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0.14), 0px 1px 1px 0px rgba(0,0,0,0.12)'
    },
    title: {
        marginBottom: 0
    },
    content: {
        "&:last-child": {
            paddingBottom: 0
        }
    }
});

const getFacet = (props: MetadataViewFacetProperties) => {
    switch (props.type) {
        case "text":
            return <TextSelectionFacet {...props} />;
        case "number":
            return <NumericalRangeSelectionFacet {...props} />;
        case "date":
            return <DateSelectionFacet {...props} />;
        default:
            return <></>;
    }
};

const Facet = (props: MetadataViewFacetProperties) => {
    const classes = useStyles();
    return (
        <Card className={`${classes.root} ${props.extraClasses}`} variant="outlined">
            <CardContent className={classes.content}>
                {getFacet({...props, classes})}
            </CardContent>
        </Card>
    );
};

export default Facet;
