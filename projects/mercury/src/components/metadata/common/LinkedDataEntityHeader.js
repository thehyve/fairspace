import React from 'react';
import {Chip, Divider, Grid, Tooltip, Typography, withStyles} from "@material-ui/core";

import {Delete} from "@material-ui/icons";
import useLinkedData from '../UseLinkedData';
import Iri from "../../common/Iri";
import IriTooltip from "../../common/IriTooltip";
import CollectionBrowserLink from "./CollectionBrowserLink";
import {DATE_DELETED_URI, FILE_PATH_URI, FIXED_SHAPE_URI} from "../../../constants";
import DeleteEntityButton from "./DeleteEntityButton";
import CopyButton from "../../common/CopyButton";

const styles = {
    iri: {
        maxWidth: '570px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }
};

export const LinkedDataEntityHeader = ({subject, classes = {}, context = {}}) => {
    const {
        linkedDataLoading = false,
        linkedDataError = false,
        values = {},
        typeInfo = {}
    } = context;

    return !linkedDataError && !linkedDataLoading && (
        <>
            <Grid container justify="space-between" style={{alignItems: "center"}}>
                <Grid item style={{display: "flex", alignItems: "center"}}>
                    <Typography variant="h5" className={classes.iri}>
                        <IriTooltip title={subject}>
                            <Iri iri={subject} />
                        </IriTooltip>
                    </Typography>

                    <CopyButton style={{marginLeft: 10}} value={subject} />
                </Grid>
                <Grid item style={{display: "flex", alignItems: "center"}}>
                    {
                        values[DATE_DELETED_URI]
                            ? <Tooltip title="This entity has been deleted" style={{padding: 12, color: 'red'}}><Delete /></Tooltip>
                            : (
                                <DeleteEntityButton
                                    subject={subject}
                                    isDeletable={!values[FIXED_SHAPE_URI]}
                                />
                            )
                    }

                    <CollectionBrowserLink
                        type={typeInfo.typeIri}
                        filePath={values[FILE_PATH_URI]}
                    />

                    <Tooltip
                        title={(
                            <Typography
                                variant="caption"
                                color="inherit"
                                style={{whiteSpace: 'pre-line'}}
                            >
                                {typeInfo.description}
                            </Typography>
                        )}
                        aria-label={typeInfo.description}
                    >
                        <Chip label={typeInfo.label || '........'} />
                    </Tooltip>
                </Grid>
            </Grid>
            <Divider style={{marginTop: 16}} />
        </>
    );
};

const ContextualLinkedDataEntityHeader = props => (
    <LinkedDataEntityHeader
        {...props}
        context={useLinkedData(props.subject)}
    />
);

export default withStyles(styles)(ContextualLinkedDataEntityHeader);
