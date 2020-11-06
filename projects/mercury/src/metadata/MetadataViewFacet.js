import React, {useState} from 'react';
import {Card, CardContent, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Radio, RadioGroup} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

type Option = {
    label: string;
    iri: string;
}

type MetadataViewFacetProperties = {
    title: string;
    options: Option[];
    multiple?: boolean;
    onChange: (string[]) => void;
    extraClasses: string;
};
type SelectProperties = {
    options: Option[];
    onChange: (string[]) => void;
}

const useStyles = makeStyles({
    root: {
        width: 275
    },
    title: {
        size: 'h3'
    }
});

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

const MetadataViewFacet = (props: MetadataViewFacetProperties) => {
    const {title, options = [], multiple = false, onChange = () => {}, extraClasses = ''} = props;
    const classes = useStyles();

    return (
        <Card className={`${classes.root} ${extraClasses}`} variant="outlined">
            <CardContent>
                <FormControl component="fieldset">
                    <FormLabel className={`${classes.title} ${extraClasses}`} component="legend">{title}</FormLabel>
                    {multiple
                        ? <SelectMultiple options={options} onChange={onChange} />
                        : <SelectSingle options={options} onChange={onChange} />}
                </FormControl>
            </CardContent>
        </Card>
    );
};

export default MetadataViewFacet;
