import React, {useCallback} from "react";
import {Grid} from "@material-ui/core";
import {isNonEmptyValue, MessageDisplay, useAsync} from '@fairspace/shared-frontend';

import {LinkedDataEntityFormWithLinkedData} from '../../metadata/common/LinkedDataEntityFormContainer';
import TechnicalMetadata from "../../file/TechnicalMetadata";
import FileAPI from "../../file/FileAPI";

const PathMetadata = ({
    path,
    ...otherProps
}) => {
    const {data, error, loading} = useAsync(useCallback(
        () => FileAPI.stat(path), [path]
    ));

    if (error) {
        return (<MessageDisplay message="An error occurred while determining metadata subject" />);
    } if (loading) {
        return (<div>Loading...</div>);
    }

    // Parse stat data
    const fileProps = data && data.props;
    const subject = fileProps && fileProps.iri;

    if (!subject || !fileProps) {
        return (<div>No metadata found</div>);
    }
    return (
        <Grid container>
            <Grid item xs={12} style={{marginBottom: 8}}>
                <TechnicalMetadata
                    fileProps={{
                        dateCreated: fileProps.creationdate,
                        createdBy: fileProps.createdBy,
                        dateModified: fileProps.getlastmodified,
                        modifiedBy: fileProps.modifiedBy,
                        ownedBy: fileProps.ownedBy,
                        fileSize: isNonEmptyValue(fileProps.getcontentlength) ? parseInt(fileProps.getcontentlength, 10) : undefined,
                        checksum: fileProps.checksum
                    }}
                />
            </Grid>
            <Grid item xs={12}>
                <LinkedDataEntityFormWithLinkedData
                    subject={fileProps.iri}
                    {...otherProps}
                />
            </Grid>
        </Grid>
    );
};

export default PathMetadata;
