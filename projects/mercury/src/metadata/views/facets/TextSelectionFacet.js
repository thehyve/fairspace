import React, {useState} from 'react';
import {Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Radio, RadioGroup} from "@material-ui/core";
import type {MetadataViewFacetProperties} from "../MetadataViewFacetFactory";


type SelectProperties = {
    options: Option[];
    onChange: (string[]) => void;
}


const SelectSingle = (props: SelectProperties) => {
    const {options, onChange} = props;
    const [value, setValue] = useState(null);

    const handleChange = (event) => {
        const newValue = event.target.value;
        setValue(newValue);
        onChange([newValue]);
    };

    return (
        <RadioGroup value={value} onChange={handleChange}>
            {options.map(option => (
                <FormControlLabel value={option.iri} control={<Radio />} label={option.label} />
            ))}
        </RadioGroup>
    );
};

const SelectMultiple = (props: SelectProperties) => {
    const {options, onChange} = props;
    const [state, setState] = useState(Object.fromEntries(options.map(option => [option.iri, false])));

    const handleChange = (event) => {
        const newState = {...state, [event.target.name]: event.target.checked};
        setState(newState);
        const selected = Object.entries(newState)
            .filter(([option, checked]) => checked)
            .map(([option, checked]) => option);
        onChange(selected);
    };

    return (
        <FormGroup>
            {options.map(option => (
                <FormControlLabel
                    key={option.iri}
                    control={(
                        <Checkbox
                            checked={state[option.iri]}
                            onChange={handleChange}
                            name={option.iri}
                        />
                    )}
                    label={option.label}
                />
            ))}
        </FormGroup>
    );
};

const TextSelectionFacet = (props: MetadataViewFacetProperties) => {
    const {title, options = [], multiple = false, onChange = () => {}, classes, extraClasses = ''} = props;

    return (
        <FormControl component="fieldset">
            <FormLabel className={`${classes.title} ${extraClasses}`} component="legend">{title}</FormLabel>
            {multiple
                ? <SelectMultiple options={options} onChange={onChange} />
                : <SelectSingle options={options} onChange={onChange} />}
        </FormControl>
    );
};

export default TextSelectionFacet;
