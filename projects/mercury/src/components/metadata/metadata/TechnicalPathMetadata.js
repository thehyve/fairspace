import React, {useEffect} from "react";
import {connect} from 'react-redux';
import MessageDisplay from "../../common/MessageDisplay";
import {
    getFileInfoByPath, hasFileInfoErrorByPath, isFileInfoByPathPending
} from "../../../reducers/cache/fileInfoByPathReducers";
import {statFileIfNeeded} from "../../../actions/fileActions";
import TechnicalMetadata from "./TechnicalMetadata";

const TechnicalPathMetadata = ({
    statFile,
    path,
    error,
    loading,
    fileProps
}) => {
    useEffect(() => {
        statFile(path);
    }, [path, statFile]);

    if (error) {
        return (<MessageDisplay message="An error occurred while fetching file properties" />);
    } if (loading || !fileProps) {
        return (<div>Loading...</div>);
    }

    return (
        <TechnicalMetadata
            fileProps={{
                dateCreated: fileProps.creationdate,
                createdBy: fileProps.createdBy,
                dateModified: fileProps.getlastmodified,
                modifiedBy: fileProps.modifiedBy,
                ownedBy: fileProps.ownedBy,
                fileSize: parseInt(fileProps.getcontentlength, 10),
                checksum: fileProps.checksum
            }}
        />
    );
};

const mapStateToProps = (state, {path}) => {
    const data = getFileInfoByPath(state, path);

    return {
        loading: isFileInfoByPathPending(state, path),
        error: hasFileInfoErrorByPath(state, path),
        fileProps: data && data.props
    };
};

const mapDispatchToProps = {
    statFile: statFileIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(TechnicalPathMetadata);
