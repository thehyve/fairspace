import React, {useState} from 'react';
import ReactMarkdown from "react-markdown";

import BaseInputValue from "./BaseInputValue";

const MarkdownValue = (props) => {
    const {entry: {value}, onChange} = props;

    // Show the editor if the user chose to edit
    // or if there is no value yet
    const [showEdit, setShowEdit] = useState(!value);

    if (showEdit) {
        return (
            <BaseInputValue
                {...props}
                autoFocus
                onBlur={() => setShowEdit(false)}
                onChange={onChange}
                type="text"
            />
        );
    }

    return (
        <div onClick={() => setShowEdit(true)}>
            <ReactMarkdown source={value} />
        </div>
    );
};

MarkdownValue.defaultProps = {
    entry: {value: ''}
};

export default MarkdownValue;
