import React, {useState} from 'react';

import {IconButton} from '@material-ui/core';
import {ArrowDropDown, ArrowDropUp} from '@material-ui/icons';

type ShortTextProps = {
    text: string;
    maxLength: number;
    maxLines: number;
}

export const shortenText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
        return text;
    }
    let shortText = text.substring(0, maxLength + 1);
    const nonAlphaNumerical = new RegExp(/[!\W]+/g);
    let end = 0;
    while ((nonAlphaNumerical.exec(shortText)) !== null) {
        end = nonAlphaNumerical.lastIndex - 1;
    }
    if (end < 0) {
        end = 0;
    }
    return shortText.substring(0, end);
}

export const limitLines = (text: string, maxLines: number) => {
    let newLineCount = 0;
    let start = 0, pos = 0;
    while ((pos = text.indexOf('\n', start)) !== -1) {
        newLineCount++;
        if (newLineCount >= maxLines) {
            return text.substring(0, pos);
        }
        start = pos + 1;
    }
    return text;
}

export const ShortText = (props: ShortTextProps) => {
    const [expanded, setExpanded] = useState(false);
    const toggle = () => expanded ? setExpanded(false) : setExpanded(true);
    const {text, maxLength, maxLines} = props;
    if (text == null) {
        return null;
    }
    const displayText = text.trim();
    let shortText = shortenText(displayText, maxLength);
    shortText = limitLines(shortText, maxLines);
    const overflow = (shortText.length < displayText.length);
    return (<p style={{whiteSpace: 'pre-line'}}>
        {expanded ? displayText : shortText}
        {overflow && !expanded && <span> &hellip;
            <IconButton aria-label="Expand" size="small" onClick={toggle}>
                <ArrowDropDown fontSize="inherit"/>
            </IconButton>
        </span>}
        {overflow && expanded &&
            <IconButton aria-label="Collapse" size="small" onClick={toggle}>
                <ArrowDropUp fontSize="inherit"/>
            </IconButton>}
    </p>);
};

export default ShortText;
