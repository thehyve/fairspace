import React, {useEffect} from "react";
import {connect} from 'react-redux';
import {Grid} from "@material-ui/core";

import MessageDisplay from "../../common/MessageDisplay";
import LinkedDataEntityFormContainer from "../common/LinkedDataEntityFormContainer";
import {
    getFileInfoByPath, hasFileInfoErrorByPath, isFileInfoByPathPending
} from "../../../reducers/cache/fileInfoByPathReducers";
import {statFileIfNeeded} from "../../../actions/fileActions";
import TechnicalMetadata from "../../file/TechnicalMetadata";
import {isNonEmptyValue} from "../../../utils/genericUtils";

const PathMetadata = ({
    statFile,
    subject,
    fileProps,
    path,
    type,
    error,
    loading,
    ...otherProps
}) => {
    useEffect(() => {
        statFile(path);
    }, [path, statFile]);

    if (error) {
        return (<MessageDisplay message="An error occurred while determining metadata subject" />);
    } if (loading) {
        return (<div>Loading...</div>);
    } if (!subject) {
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
                <LinkedDataEntityFormContainer
                    subject={fileProps.iri}
                    {...otherProps}
                />
            </Grid>
        </Grid>
    );
};

const mapStateToProps = (state, {path}) => {
    const data = getFileInfoByPath(state, path);

    return {
        loading: isFileInfoByPathPending(state, path),
        error: hasFileInfoErrorByPath(state, path),
        fileProps: data && data.props,
        subject: data && data.props && data.props.iri,
        type: data && data.type
    };
};

const mapDispatchToProps = {
    statFile: statFileIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(PathMetadata);
