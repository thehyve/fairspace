import React from "react";

import {LinkedDataEntityFormWithLinkedData} from './common/LinkedDataEntityFormContainer';
import FileAPI from "../file/FileAPI";
import useAsync from "../common/hooks/UseAsync";
import MessageDisplay from "../common/components/MessageDisplay";

const PathMetadata = ({
    path,
    ...otherProps
}) => {
    const {data, error, loading} = useAsync(() => FileAPI.stat(path), [path]);

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
        <LinkedDataEntityFormWithLinkedData
            subject={fileProps.iri}
            {...otherProps}
        />
    );
};

export default PathMetadata;
