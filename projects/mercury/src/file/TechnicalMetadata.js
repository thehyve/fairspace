// @flow
import React from "react";
import {List, ListItem, ListItemText} from "@material-ui/core";
import filesize from "filesize";
import {formatDateTime, isNonEmptyValue} from '../common';

const ItemData = ({primary, secondary}) => (primary && secondary ? (
    <ListItem disableGutters style={{paddingTop: 4, paddingBottom: 4}}>
        <ListItemText primary={primary} secondary={secondary} />
    </ListItem>
) : null);

export type AuditInfo = {
    dateCreated?: string;
    createdBy?: string; // username
    dateModified?: string;
    modifiedBy?: string; // username
    ownedBy?: string;
    fileSize?: number;
    checksum?: string;
}
export type TechnicalMetadataProps = {
    fileProps: AuditInfo;
};

const TechnicalMetadata = (props: TechnicalMetadataProps) => {
    const {fileProps: {dateCreated, createdBy, dateModified, modifiedBy, ownedBy, fileSize, checksum}} = props;

    return (
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
};

export default TechnicalMetadata;
