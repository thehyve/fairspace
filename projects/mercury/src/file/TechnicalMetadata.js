import React from "react";
import PropTypes from "prop-types";
import {List, ListItem, ListItemText} from "@material-ui/core";
import filesize from "filesize";

import {isNonEmptyValue, formatDateTime} from "../common/utils/genericUtils";

const ItemData = ({primary, secondary}) => (primary && secondary ? (
    <ListItem disableGutters style={{paddingTop: 4, paddingBottom: 4}}>
        <ListItemText primary={primary} secondary={secondary} />
    </ListItem>
) : null);

const TechnicalMetadata = ({fileProps: {dateCreated, createdBy, dateModified, modifiedBy, fileSize, checksum, ownedBy}}) => (
    <List dense>
        <ItemData
            primary="Created"
            secondary={(dateCreated || createdBy) && `${formatDateTime(dateCreated)} ${createdBy ? ' by ' + createdBy : ''}`}
        />

        <ItemData
            primary="Last modified"
            secondary={(dateModified || modifiedBy) && `${formatDateTime(dateModified)} ${modifiedBy ? ' by ' + modifiedBy : ''}`}
        />

        {isNonEmptyValue(fileSize) && (
            <ItemData
                primary="Filesize"
                secondary={filesize(fileSize)}
            />
        )}

        <ItemData
            primary="Checksum"
            secondary={checksum}
        />

        <ItemData
            primary="Owner"
            secondary={ownedBy}
        />
    </List>
);

TechnicalMetadata.propTypes = {
    dateCreated: PropTypes.string,
    createdBy: PropTypes.string,
    dateModified: PropTypes.string,
    modifiedBy: PropTypes.string,
    ownedBy: PropTypes.string,
    fileSize: PropTypes.number,
    checksum: PropTypes.string
};

export default TechnicalMetadata;
