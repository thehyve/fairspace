import React, {useState} from 'react';
import {Tooltip} from '@mui/material';
import ContentCopy from 'mdi-material-ui/ContentCopy';
import {CheckOutlined} from '@mui/icons-material';
import useIsMounted from 'react-is-mounted-hook';

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
                            <CheckOutlined
                                color="action"
                                fontSize="small"
                            />
                        </span>
                    ) : (
                        <span data-testid="uncopied">
                            <ContentCopy
                                color="action"
                                fontSize="small"
                            />
                        </span>
                    )}
                </span>
            </Tooltip>
        ));
};

export default CopyButton;
