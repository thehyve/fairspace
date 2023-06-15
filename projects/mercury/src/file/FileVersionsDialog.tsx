// @ts-nocheck
// @ts-nocheck
import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import FileVersionsList from "./FileVersionsList";

const FileVersionsDialog = ({
  onClose,
  selectedFile,
  isWritingEnabled,
  onRevertVersion = () => {}
}) => <Dialog onClose={onClose} aria-labelledby="file-version-dialog" open>
        <DialogTitle id="file-version-dialog">
            History of <em>{selectedFile.basename}</em>
        </DialogTitle>
        <DialogContent>
            <FileVersionsList selectedFile={selectedFile} onRevertVersion={onRevertVersion} isWritingEnabled={isWritingEnabled} />
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="secondary">
                Cancel
            </Button>
        </DialogActions>
    </Dialog>;

export default FileVersionsDialog;