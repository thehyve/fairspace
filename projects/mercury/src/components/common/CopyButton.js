import React, {useState} from 'react';
import {Tooltip} from "@material-ui/core";
import {ClipboardText, ClipboardCheck} from "mdi-material-ui/light";
import ClipboardCopy from "./ClipboardCopy";
import useIsMounted from "../../utils/useIsMounted";

const DEFAULT_TIMEOUT = 1000;

/**
 * This button allows the user to copy a value to the clipboard.
 * If the value is copied, the icon changes and a popup is shown for a short time.
 *
 * @param value
 * @param timeout
 * @param popupLabel
 * @returns {*}
 * @constructor
 */
const CopyButton = ({
    value,
    fontSize = 'default',
    timeout = DEFAULT_TIMEOUT,
    popupLabel = 'Copied!',
    style = {}
}) => {
    const [justCopied, setJustCopied] = useState(false);
    const isMounted = useIsMounted();

    const handleCopy = () => {
        setJustCopied(true);
        setTimeout(() => isMounted() && setJustCopied(false), timeout);
    };

    return (
        <span style={{...style, cursor: 'pointer'}}>
            <ClipboardCopy value={value} onCopy={handleCopy}>
                {justCopied
                    ? <Tooltip title={popupLabel}><ClipboardCheck fontSize={fontSize} /></Tooltip>
                    : <ClipboardText fontSize={fontSize} />}
            </ClipboardCopy>
        </span>
    );
};

export default CopyButton;
