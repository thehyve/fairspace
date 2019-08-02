import React, {useState} from 'react';
import {Tooltip} from "@material-ui/core";
import {AssignmentOutlined, AssignmentTurnedInOutlined} from '@material-ui/icons';

import useIsMounted from "../../utils/useIsMounted";

const DEFAULT_TIMEOUT = 1000;

/**
 * This button allows the user to copy a value to the clipboard.
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
        if ('clipboard' in navigator) {
            setJustCopied(true);
            navigator.clipboard.writeText(value);
            setTimeout(() => isMounted() && setJustCopied(false), timeout);
        }
    };

    return (
        <Tooltip
            title={justCopied ? labelAfterCopy : labelPreCopy}
            onClick={handleCopy}
            style={{...style, cursor: 'pointer'}}
        >
            <span>
                {justCopied ? <AssignmentTurnedInOutlined color="action" /> : <AssignmentOutlined color="action" />}
            </span>
        </Tooltip>
    );
};

export default CopyButton;
