import {useState} from 'react';
import {COPY, CUT} from "../../constants";

export default () => {
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

    return {
        cut,
        copy,
        isEmpty,
        length,
        clear,

        method,
        filenames
    };
};
