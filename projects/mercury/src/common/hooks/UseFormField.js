import {useState} from "react";

export const useFormField = (initialValue, validator) => {
    const [value, setValue] = useState(initialValue);
    const [touched, setTouched] = useState(false);

    const declareTouched = () => {
        setTouched(true);
    };

    return {
        value,
        setValue,
        valid: validator(value),
        touched,
        declareTouched,
    };
};
