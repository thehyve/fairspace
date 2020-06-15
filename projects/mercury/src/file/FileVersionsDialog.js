import React from "react";

import {Dialog, DialogContent, DialogTitle} from "@material-ui/core";
import FileVersionsList from "./FileVersionsList";

const FileVersionsDialog = ({onClose, selectedFile, onRevertVersion = () => {}}) => (
    <Dialog onClose={onClose} aria-labelledby="file-version-dialog" open>
        <DialogTitle id="file-version-dialog">
            {`Select version of ${selectedFile.basename} to be reverted:`}
        </DialogTitle>
        <DialogContent>
            <FileVersionsList selectedFile={selectedFile} onRevertVersion={onRevertVersion} />
        </DialogContent>
    </Dialog>
);

export default FileVersionsDialog;
