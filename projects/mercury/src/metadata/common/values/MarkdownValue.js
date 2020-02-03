import React, {useState} from 'react';
import ReactMarkdown from "react-markdown";

import BaseInputValue from "./BaseInputValue";

const MarkdownValue = (props) => {
    // Show the editor if the user chose to edit
    // or if there is no value yet
    const [showEdit, setShowEdit] = useState(!props.entry.value);

    if (showEdit || !props.entry.value || !props.entry.value.trim()) {
        return (
            <BaseInputValue
                {...props}
                autoFocus={showEdit && !!props.entry.value}
                onBlur={() => setShowEdit(false)}
                type="text"
            />
        );
    }

    return (
        <div onClick={() => setShowEdit(true)}>
            <ReactMarkdown source={props.entry.value} />
        </div>
    );
};

MarkdownValue.defaultProps = {
    entry: {value: ''}
};

export default MarkdownValue;
