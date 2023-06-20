// @ts-nocheck
import React, {useState} from "react";
import useIsMounted from "react-is-mounted-hook";
import FileVersionsDialog from "../FileVersionsDialog";

const ShowFileVersionsButton = ({
    children,
    disabled,
    selectedFile,
    onRevert,
    isWritingEnabled
}) => {
    const [opened, setOpened] = useState(false);
    const isMounted = useIsMounted();

    const openDialog = e => {
        if (e) e.stopPropagation();
        setOpened(true);
    };

    const closeDialog = e => {
        if (e) e.stopPropagation();
        setOpened(false);
    };

    const revertVersion = selectedVersion => {
        onRevert(selectedVersion).then(shouldClose => isMounted() && shouldClose && closeDialog());
    };

    return <>
        <span style={{
            display: 'inherit'
        }} onClick={e => !disabled && openDialog(e)}>
            {children}
        </span>
        {opened ? <FileVersionsDialog onClose={closeDialog} selectedFile={selectedFile} onRevertVersion={revertVersion} isWritingEnabled={isWritingEnabled} /> : null}
    </>;
};

export default ShowFileVersionsButton;