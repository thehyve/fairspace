import React, {useState} from 'react';
import {Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Radio, RadioGroup} from "@material-ui/core";
import {Clear, Search} from "@material-ui/icons";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
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
    const [textFilterValue, setTextFilterValue] = useState("");
    const showFilter = options.length > 5; // TODO decide if it should be conditional or configurable

    const handleChange = (event) => {
        const newState = {...state, [event.target.name]: event.target.checked};
        setState(newState);
        const selected = Object.entries(newState)
            .filter(([option, checked]) => checked)
            .map(([option, checked]) => option);
        onChange(selected);
    };

    const renderCheckboxList = () => options
        .filter(o => textFilterValue.trim() === "" || o.label.toLowerCase().includes(textFilterValue.toLowerCase()))
        .map(option => (
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
        ));

    const renderTextFilter = () => (
        <TextField
            id="textFilter"
            value={textFilterValue}
            onChange={e => setTextFilterValue(e.target.value)}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Search fontSize="small" />
                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            onClick={() => setTextFilterValue("")}
                            disabled={!textFilterValue}
                            style={{order: 1}}
                        >
                            <Clear color="disabled" fontSize="small" />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    );

    return (
        <>
            {showFilter && renderTextFilter()}
            <FormGroup>
                {renderCheckboxList()}
            </FormGroup>
        </>
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
