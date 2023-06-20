import React, {useState} from 'react';
import {COPY, CUT} from "../../constants";

const ClipboardContext = React.createContext({
    cut: () => {},
    copy: () => {},
    isEmpty: () => {},
    length: () => {},
    clear: () => {},
    method: '',
    filenames: [],
});

export const ClipboardProvider = ({children}) => {
    const [method, setMethod] = useState(CUT);
    const [filenames, setFilenames] = useState([]);

    const cut = paths => {
        setMethod(CUT);
        setFilenames(paths);
    };

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
                cut,
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
