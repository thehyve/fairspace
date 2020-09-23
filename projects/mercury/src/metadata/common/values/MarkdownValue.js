import React, {useState} from 'react';
import ReactMarkdown from "react-markdown";

import Tooltip from "@material-ui/core/Tooltip";
import Link from "@material-ui/core/Link";
import BaseInputValue from "./BaseInputValue";

const MarkdownValue = (props) => {
    // Show the editor if the user chose to edit
    // or if there is no value yet
    const [showEdit, setShowEdit] = useState(!props.entry.value);

    return (
        <Tooltip
            interactive
            title={(
                <div>
                    {'This is a '}
                    <Link href="https://www.markdownguide.org/" target="_blank" rel="noreferrer">Markdown</Link>
                    {' field'}
                </div>
            )}
        >
            <div onClick={() => setShowEdit(true)}>
                {showEdit || !props.entry.value || !props.entry.value.trim() ? (

                    <BaseInputValue
                        {...props}
                        autoFocus={showEdit && !!props.entry.value}
                        onBlur={() => setShowEdit(false)}
                        type="text"
                    />

                ) : (<ReactMarkdown source={props.entry.value} />)}
            </div>
        </Tooltip>
    );
};

MarkdownValue.defaultProps = {
    entry: {value: ''}
};

export default MarkdownValue;
