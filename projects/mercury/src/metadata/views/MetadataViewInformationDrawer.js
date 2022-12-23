// @flow
import React, {useState} from 'react';
import {Card, CardContent, CardHeader, Collapse, IconButton} from '@mui/material';
import {withRouter} from 'react-router-dom';

import {ExpandMore} from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import EmptyInformationDrawer from "../../common/components/EmptyInformationDrawer";
import {LinkedDataEntityFormWithLinkedData} from '../common/LinkedDataEntityFormContainer';
import type {MetadataViewEntityWithLinkedFiles} from "./metadataViewUtils";

const useStyles = makeStyles(() => ({
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    card: {
        marginTop: 10,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        outline: "none",
        transitionBorder: ".24s",
        easeInOut: true
    },
    emptyLinkedFiles: {
        fontStyle: 'italic'
    }
}));

type MetadataViewInformationDrawerProps = {
    entity: MetadataViewEntityWithLinkedFiles;
    forceExpand: boolean;
    viewIcon: any;
};

const MetadataViewInformationDrawer = (props: MetadataViewInformationDrawerProps) => {
    const {forceExpand, entity, viewIcon} = props;
    const [expandedManually, setExpandedManually] = useState(null); // true | false | null
    const expanded = (expandedManually != null) ? expandedManually : forceExpand;
    const toggleExpand = () => setExpandedManually(!expanded === forceExpand ? null : !expanded);
    const classes = useStyles();

    if (!entity) {
        return <EmptyInformationDrawer message="Select a row to display its metadata" />;
    }

    return (
        <Card className={classes.card}>
            <CardHeader
                titleTypographyProps={{variant: 'h6'}}
                title={`Metadata for ${entity.label}`}
                avatar={viewIcon}
                style={{wordBreak: 'break-word'}}
                action={(
                    <IconButton
                        onClick={toggleExpand}
                        aria-expanded={expanded}
                        aria-label="Show more"
                        className={expanded ? classes.expandOpen : ''}
                        size="large">
                        <ExpandMore />
                    </IconButton>
                )}
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <LinkedDataEntityFormWithLinkedData
                        subject={entity.iri}
                        hasEditRight={false}
                    />
                </CardContent>
            </Collapse>
        </Card>
    );
};

export default withRouter(MetadataViewInformationDrawer);
