import React, {useState} from 'react';
import {Tooltip} from "@mui/material";
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import useIsMounted from "react-is-mounted-hook";

const DEFAULT_TIMEOUT = 1000;
const clipboardSupported = 'clipboard' in navigator;

/**
 * This button allows the user to copy a value to the clipboard.
 * It will only be rendered if the browser supports the clipboard API
 * If the value is copied, the icon changes and a popup is shown for a short time.
 *
 * @param value
 * @param timeout
 * @param labelPreCopy
 * @param labelAfterCopy
 */
const CopyButton = ({
    value, style = {}, timeout = DEFAULT_TIMEOUT,
    labelPreCopy = 'Copy full IRI', labelAfterCopy = 'Copied!',
}) => {
    const [justCopied, setJustCopied] = useState(false);
    const isMounted = useIsMounted();

    const handleCopy = () => {
        setJustCopied(true);
        navigator.clipboard.writeText(value);
        setTimeout(() => isMounted() && setJustCopied(false), timeout);
    };

    return (
        clipboardSupported && (
            <Tooltip
                data-testid="tooltip"
                title={justCopied ? labelAfterCopy : labelPreCopy}
                onClick={handleCopy}
                style={{...style, cursor: 'pointer'}}
            >
                <span>
                    {justCopied ? (
                        <span data-testid="copied">
                            <AssignmentTurnedInOutlined
                                color="action"
                            />
                        </span>
                    ) : (
                        <span data-testid="uncopied">
                            <AssignmentOutlined
                                color="action"
                            />
                        </span>
                    )}
                </span>
            </Tooltip>
        ));
};

export default CopyButton;
