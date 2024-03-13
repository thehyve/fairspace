import React, {useState} from 'react';
import ReactMarkdown from 'react-markdown';

import BaseInputValue from './BaseInputValue';

const MarkdownValue = props => {
    // Show the editor if the user chose to edit
    // or if there is no value yet
    const [showEdit, setShowEdit] = useState(!props.entry.value);

    return (
        <div onClick={() => setShowEdit(true)}>
            {showEdit || !props.entry.value || !props.entry.value.trim() ? (
                <BaseInputValue
                    {...props}
                    autoFocus={showEdit && !!props.entry.value}
                    onBlur={() => setShowEdit(false)}
                    type="text"
                />
            ) : (
                <ReactMarkdown>{props.entry.value}</ReactMarkdown>
            )}
        </div>
    );
};

MarkdownValue.defaultProps = {
    entry: {value: ''}
};

export default MarkdownValue;
