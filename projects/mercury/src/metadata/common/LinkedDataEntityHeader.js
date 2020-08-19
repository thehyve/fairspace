import React from 'react';
import PropTypes from "prop-types";

import {Chip, Divider, Grid, Tooltip, Typography, withStyles} from "@material-ui/core";
import IriTooltip from "../../common/components/IriTooltip";
import CollectionBrowserLink from "./CollectionBrowserLink";
import {
    COLLECTION_URI, DATE_DELETED_URI,
    DIRECTORY_URI,
    FILE_PATH_URI,
    FILE_URI,
    FIXED_SHAPE_URI
} from "../../constants";
import DeleteEntityButton from "./DeleteEntityButton";
import CopyButton from "../../common/components/CopyButton";
import UseNamespacedIri from '../../common/hooks/UseNamespacedIri';

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

const LinkedDataEntityHeader = ({
    subject,
    classes = {},
    linkedDataLoading = false,
    linkedDataError = false,
    values = {},
    typeInfo = {},
    updateLinkedData
}) => {
    const isProtectedEntity = PROTECTED_ENTITY_TYPES.includes(values['@type'] && values['@type'][0] && values['@type'][0].id);
    const namespacedIri = UseNamespacedIri(subject);
    const isDeleted = values[DATE_DELETED_URI];

    return !linkedDataError && !linkedDataLoading && (
        <>
            <Grid container justify="space-between" style={{alignItems: "center"}}>
                <Grid item style={{display: "flex", alignItems: "center"}}>
                    <Typography variant="h5" className={`${classes.iri} ${isDeleted ? classes.deletedIri : ''}`}>
                        <IriTooltip title={subject}>
                            <span>{namespacedIri}</span>
                        </IriTooltip>
                    </Typography>

                    <CopyButton style={{marginLeft: 10}} value={subject} />
                </Grid>
                <Grid item style={{display: "flex", alignItems: "center"}}>
                    <DeleteEntityButton
                        subject={subject}
                        isDeletable={!isDeleted && !isProtectedEntity}
                        updateLinkedData={updateLinkedData}
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

export default withStyles(styles)(LinkedDataEntityHeader);
