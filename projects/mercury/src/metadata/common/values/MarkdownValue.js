import React, {useState} from 'react';
import ReactMarkdown from "react-markdown";

import BaseInputValue from "./BaseInputValue";

const MarkdownValue = (props) => {
    const {entry: {value}, onChange} = props;

    // Show the editor if the user chose to edit
    // or if there is no value yet
    const [showEdit, setShowEdit] = useState(!value);

    // After a change, the markdown value should be rendered again
    const handleChange = e => {
        setShowEdit(false);
        return onChange(e);
    };

    if (showEdit) {
        return <BaseInputValue {...props} onChange={handleChange} type="text" />;
    }

    return <div onClick={() => setShowEdit(true)}><ReactMarkdown source={value} /></div>;
};

MarkdownValue.defaultProps = {
    entry: {value: ''}
};

export default MarkdownValue;
