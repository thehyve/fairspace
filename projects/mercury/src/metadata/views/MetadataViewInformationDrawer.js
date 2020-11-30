// @flow
import React, {useState} from 'react';
import {Card, CardContent, CardHeader, Collapse, IconButton} from '@material-ui/core';
import {withRouter} from 'react-router-dom';

import {ExpandMore} from '@material-ui/icons';
import {makeStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import EmptyInformationDrawer from "../../common/components/EmptyInformationDrawer";
import {LinkedDataEntityFormWithLinkedData} from '../common/LinkedDataEntityFormContainer';
import {getContextualFileLink} from "./metadataViewUtils";
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
    showLinkedFiles: boolean;
    locationContext: string;
};

const MetadataViewInformationDrawer = (props: MetadataViewInformationDrawerProps) => {
    const {forceExpand, entity, viewIcon, showLinkedFiles, locationContext} = props;
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
                    >
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
                    {showLinkedFiles && (
                        <div>
                            <Typography color="textSecondary" id="file-list">
                                Linked files
                            </Typography>
                            <List dense>
                                {entity.linkedFiles && entity.linkedFiles.length > 0 ? (
                                    entity.linkedFiles.map(file => (
                                        <ListItem key={file.iri} button component="a" href={getContextualFileLink(file.iri, locationContext)}>
                                            <ListItemText
                                                primary={file.label}
                                            />
                                        </ListItem>
                                    ))) : (
                                    <Typography variant="body2" className={classes.emptyLinkedFiles}>
                                        Entity is not linked to a file.
                                    </Typography>
                                )}
                            </List>
                        </div>
                    )}
                </CardContent>
            </Collapse>
        </Card>
    );
};

export default withRouter(MetadataViewInformationDrawer);
