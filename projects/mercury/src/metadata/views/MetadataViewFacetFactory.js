import React, {useState} from "react";
import {Card, CardContent, CardHeader, Collapse, IconButton} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import classnames from "classnames";
import {Clear, ExpandMore} from "@material-ui/icons";
import type {ValueType} from "./MetadataViewAPI";
import TextSelectionFacet from "./facets/TextSelectionFacet";
import DateSelectionFacet from "./facets/DateSelectionFacet";
import NumericalRangeSelectionFacet from "./facets/NumericalRangeSelectionFacet";

export type Option = {
    value: string;
    label: string;
    access?: string;
};

export type MetadataViewFacetProperties = {
    title: string;
    options: Option[];
    type: ValueType;
    onChange: (string[]) => void;
    extraClasses?: string;
    classes?: any;
    activeFilterValues: any[];
    clearFilter: () => {};
};

const useStyles = makeStyles((theme) => ({
    root: {
        width: 250,
        boxShadow: "0px 1px 1px -1px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0.14), 0px 1px 1px 0px rgba(0,0,0,0.12)"
    },
    title: {
        "padding": 8,
        "fontWidth": "bold",
        "& .MuiCardHeader-action": {
            alignSelf: "auto",
            margin: 0
        }
    },
    content: {
        "&:last-child": {
            paddingTop: 0,
            paddingBottom: 8
        }
    },
    input: {
        fontSize: "small"
    },
    textContent: {
        width: "100%",
        maxHeight: 220,
        overflowY: "auto"
    },
    expand: {
        transform: "rotate(0deg)",
        marginLeft: "auto",
        transition: theme.transitions.create("transform", {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: "rotate(180deg)",
    },
    headerIcon: {
        padding: 0
    },
    multiselectList: {
        "& .MuiFormControlLabel-root": {
            marginRight: 0
        }
    },
    accessFilter: {
        alignContent: "center",
        marginBottom: 10
    }
}));

const getFacet = (props: MetadataViewFacetProperties) => {
    switch (props.type) {
        case "Identifier":
        case "Term":
        case "TermSet":
            return <TextSelectionFacet {...props} />;
        case "Number":
            return <NumericalRangeSelectionFacet {...props} />;
        case "Date":
            return <DateSelectionFacet {...props} />;
        default:
            return <></>;
    }
};

const Facet = (props: MetadataViewFacetProperties) => {
    const {clearFilter, title, activeFilterValues, extraClasses} = props;
    const classes = useStyles();
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => setExpanded(!expanded);

    const cardHeaderAction = (
        <IconButton
            className={classnames(classes.expand, {
                [classes.expandOpen]: expanded,
            }, classes.headerIcon)}
            onClick={toggleExpand}
            aria-expanded={expanded}
            aria-label="Show more"
        >
            <ExpandMore />
        </IconButton>
    );

    const clearFiltersAction = (
        activeFilterValues.length > 0 && (
            <IconButton
                onClick={clearFilter}
                aria-label="Clear"
                className={classes.headerIcon}
            >
                <Clear fontSize="small" color="primary" />
            </IconButton>
        )
    );

    return (
        <Card className={`${classes.root} ${extraClasses}`} variant="outlined">
            <CardHeader
                className={classes.title}
                titleTypographyProps={{color: "textSecondary", variant: "body1"}}
                title={title}
                avatar={cardHeaderAction}
                action={clearFiltersAction}
            />
            <Collapse in={expanded} timeout="auto">
                <CardContent className={classes.content}>
                    {getFacet({...props, classes})}
                </CardContent>
            </Collapse>
        </Card>
    );
};

export default Facet;
