import React, {useEffect, useState} from 'react';
import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input";
import Slider from "@material-ui/core/Slider";
import {Typography} from "@material-ui/core";
import type {MetadataViewFacetProperties} from "../MetadataViewFacetFactory";
import {isNonEmptyValue} from "../../../common/utils/genericUtils";

const nonEmptyNumber = (value, alternative) => (isNonEmptyValue(value) ? Number(value) : alternative);

const NumericalRangeSelectionFacet = (props: MetadataViewFacetProperties) => {
    const {options = [], onChange = () => {}, activeFilterValues, classes} = props;
    const minValue = nonEmptyNumber(options[0], -1);
    const maxValue = nonEmptyNumber(options[1], -1);
    const [value, setValue] = useState([null, null]);
    const [validationError, setValidationError] = useState(null);

    useEffect(() => {
        if (activeFilterValues.length > 0) {
            setValue(activeFilterValues);
        } else {
            setValue([null, null]);
        }
    }, [activeFilterValues]);

    const handleChange = (val: number[]) => {
        setValidationError(null);
        onChange(val);
    };

    const handleSliderChange = (event, val) => {
        if (val instanceof Array) {
            handleChange(val);
        } else if (value[0] === null) {
            handleChange([null, val]);
        } else {
            handleChange([val, null]);
        }
    };

    const handleMinValueInputChange = (event) => {
        const newMinValue = event.target.value;
        setValue([newMinValue, value[1]]);
        if (isNonEmptyValue(newMinValue)) {
            if (Number.isNaN(newMinValue)) {
                setValidationError("Min value has to be a number.");
            } else if (Number(newMinValue) < minValue) {
                setValidationError(`Min value cannot be lower than ${minValue}.`);
            } else if (Number(newMinValue) > value[1]) {
                setValidationError("Min value cannot be higher than max value.");
            } else {
                handleChange([Number(newMinValue), value[1]]);
            }
        } else {
            handleChange([null, value[1]]);
        }
    };

    const handleMaxValueInputChange = (event) => {
        const newMaxValue = event.target.value;
        setValue([value[0], newMaxValue]);
        if (isNonEmptyValue(event.target.value)) {
            if (Number.isNaN(newMaxValue)) {
                setValidationError("Max value has to be a number.");
            } else if (Number(newMaxValue) > maxValue) {
                setValidationError(`Max value cannot be higher than ${maxValue}.`);
            } else if (Number(newMaxValue) < value[0]) {
                setValidationError("Max value cannot be lower than min value.");
            } else {
                handleChange([value[0], Number(newMaxValue)]);
            }
        } else {
            handleChange([value[0], null]);
        }
    };

    const handleBlur = () => {
        if (validationError) {
            if (activeFilterValues.length > 0) {
                setValue(activeFilterValues);
            } else {
                setValue([null, null]);
            }
        }
        setValidationError(null);
    };

    const renderInput = (inputValue, handleInputChange, placeholder) => (
        <Input
            value={nonEmptyNumber(inputValue, "")}
            margin="dense"
            onChange={handleInputChange}
            onBlur={handleBlur}
            error={!!validationError}
            inputProps={{
                'step': 1,
                'min': minValue,
                'max': maxValue,
                'type': 'number',
                'aria-labelledby': 'input-slider',
                'placeholder': placeholder
            }}
        />
    );

    const getSliderValue = () => {
        const val1 = nonEmptyNumber(value[0], null);
        const val2 = nonEmptyNumber(value[1], null);
        if (val1 != null && val2 != null) {
            return [val1, val2];
        }
        if (val1 != null) {
            return val1;
        }
        return val2;
    };

    const renderSlider = () => (
        <Slider
            value={getSliderValue()}
            track={value[1] === null && isNonEmptyValue(value[0]) ? 'inverted' : 'normal'}
            onChange={handleSliderChange}
            valueLabelDisplay="auto"
            aria-labelledby="range-slider"
            getAriaValueText={() => value}
            min={minValue}
            max={maxValue}
        />
    );

    return (
        <div>
            <Grid container spacing={2} alignItems="center" className={classes.numericalContent}>
                <Grid item xs={3}>
                    {renderInput(value[0], handleMinValueInputChange, minValue)}
                </Grid>
                <Grid item xs={6}>
                    {renderSlider()}
                </Grid>
                <Grid item xs={3}>
                    {renderInput(value[1], handleMaxValueInputChange, maxValue)}
                </Grid>
            </Grid>
            <Typography color="error">
                {validationError}
            </Typography>
        </div>
    );
};

export default NumericalRangeSelectionFacet;
