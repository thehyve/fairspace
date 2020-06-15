import React from 'react';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import {ListItemText} from "@material-ui/core";
import useAsync from "../common/hooks/UseAsync";
import FileAPI from "./FileAPI";
import MessageDisplay from "../common/components/MessageDisplay";

const FileVersionsList = ({selectedFile, onRevertVersion}) => {
    const {data, error, loading} = useAsync(() => FileAPI.showFileHistory(selectedFile.filename));

    if (error) {
        return (<MessageDisplay message="An error occurred while reverting the file to a previous version" />);
    } if (loading) {
        return (<div>Loading...</div>);
    }

    return (
        <List>
            {!data ? (
                <div>No previous version found.</div>
            ) : data.map((fileVersion) => (
                <ListItem key={fileVersion.filename} onClick={() => onRevertVersion(fileVersion.iri)}>
                    <ListItem icon>
                        <ListItemText>{fileVersion.dateModified}</ListItemText>
                    </ListItem>
                </ListItem>
            ))}
        </List>
        // TODO: <<previous  next>>
    );
};

export default FileVersionsList;
