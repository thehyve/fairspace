import React from 'react';
import PropTypes from "prop-types";

import {Chip, Divider, Grid, Tooltip, Typography, withStyles} from "@material-ui/core";
import useLinkedData from '../UseLinkedData';
import Iri from "../../common/Iri";
import IriTooltip from "../../common/IriTooltip";
import CollectionBrowserLink from "./CollectionBrowserLink";
import {
    COLLECTION_URI, DATE_DELETED_URI, DIRECTORY_URI, FILE_PATH_URI, FILE_URI, FIXED_SHAPE_URI
} from "../../../constants";
import DeleteEntityButton from "./DeleteEntityButton";
import CopyButton from "../../common/CopyButton";

const styles = {
    iri: {
        maxWidth: '570px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },

    deletedIri: {
        textDecoration: 'line-through'
    },

    deleteText: {
        color: 'red',
        fontSize: '0.7em'
    }
};

const PROTECTED_ENTITY_TYPES = [COLLECTION_URI, FILE_URI, DIRECTORY_URI];

export const LinkedDataEntityHeader = ({
    subject,
    classes = {},
    linkedDataLoading = false,
    linkedDataError = false,
    values = {},
    typeInfo = {}
}) => {
    const isDeleted = values[DATE_DELETED_URI];
    const isFixedShape = values[FIXED_SHAPE_URI];
    const isProtectedEntity = PROTECTED_ENTITY_TYPES.includes(values['@type'] && values['@type'][0] && values['@type'][0].id);

    return !linkedDataError && !linkedDataLoading && (
        <>
            <Grid container justify="space-between" style={{alignItems: "center"}}>
                <Grid item style={{display: "flex", alignItems: "center"}}>
                    <Typography variant="h5" className={`${classes.iri} ${isDeleted ? classes.deletedIri : ''}`}>
                        <IriTooltip title={subject}>
                            <Iri iri={subject} />
                        </IriTooltip>
                    </Typography>

                    <CopyButton style={{marginLeft: 10}} value={subject} />
                </Grid>
                <Grid item style={{display: "flex", alignItems: "center"}}>
                    <DeleteEntityButton
                        subject={subject}
                        isDeletable={!isDeleted && !isFixedShape && !isProtectedEntity}
                    />

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

            {isDeleted ? <span className={classes.deleteText}>This entity has been deleted</span> : ''}

            <Divider style={{marginTop: 16}} />
        </>
    );
};

LinkedDataEntityHeader.propTypes = {
    subject: PropTypes.string.isRequired
};

const ContextualLinkedDataEntityHeader = props => (
    <LinkedDataEntityHeader
        {...props}
        {...useLinkedData(props.subject)}
    />
);

export default withStyles(styles)(ContextualLinkedDataEntityHeader);
