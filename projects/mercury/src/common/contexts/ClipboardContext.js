import React, {useState} from 'react';
import {COPY} from "../../constants";

const ClipboardContext = React.createContext({
    copy: () => {},
    isEmpty: () => {},
    length: () => {},
    clear: () => {},
    method: '',
    filenames: [],
});

export const ClipboardProvider = ({children}) => {
    const [method, setMethod] = useState(COPY);
    const [filenames, setFilenames] = useState([]);

    const copy = paths => {
        setMethod(COPY);
        setFilenames(paths);
    };

    const isEmpty = () => filenames.length === 0;
    const length = () => filenames.length;
    const clear = () => setFilenames([]);

    return (
        <ClipboardContext.Provider
            value={{
                copy,
                isEmpty,
                length,
                clear,

                method,
                filenames
            }}
        >
            {children}
        </ClipboardContext.Provider>
    );
};

export default ClipboardContext;
