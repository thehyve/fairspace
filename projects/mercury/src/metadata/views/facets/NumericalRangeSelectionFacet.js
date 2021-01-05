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
    const minValue = nonEmptyNumber(options[0], null);
    const maxValue = nonEmptyNumber(options[1], null);

    const [value, setValue] = useState([null, null]);
    const [dynamicSliderValue, setDynamicSliderValue] = useState([minValue, maxValue]);
    const [validationError, setValidationError] = useState(null);

    useEffect(() => {
        if (activeFilterValues.length > 0) {
            setValue(activeFilterValues);
            setDynamicSliderValue(activeFilterValues);
        } else {
            setValue([null, null]);
            setDynamicSliderValue([minValue, maxValue]);
        }
    }, [activeFilterValues, minValue, maxValue]);

    const commitChange = (val: number[]) => {
        setValidationError(null);
        onChange(val);
    };

    const handleInputChange = (val: number[]) => {
        setDynamicSliderValue(val);
        commitChange(val);
    };

    const handleMinValueInputChange = (event) => {
        const newMinValue = event.target.value;
        setValue([newMinValue, value[1]]);
        if (isNonEmptyValue(newMinValue)) {
            if (Number.isNaN(newMinValue)) {
                setValidationError("Min value has to be a number.");
            } else if (minValue !== null && Number(newMinValue) < minValue) {
                setValidationError(`Min value cannot be lower than ${minValue}.`);
            } else if (isNonEmptyValue(value[1]) && Number(newMinValue) > value[1]) {
                setValidationError("Min value cannot be higher than max value.");
            } else if (maxValue !== null && Number(newMinValue) > maxValue) {
                setValidationError(`Min value cannot be higher than ${maxValue}.`);
            } else {
                handleInputChange([Number(newMinValue), value[1]]);
            }
        } else {
            handleInputChange([null, value[1]]);
        }
    };

    const handleMaxValueInputChange = (event) => {
        const newMaxValue = event.target.value;
        setValue([value[0], newMaxValue]);
        if (isNonEmptyValue(event.target.value)) {
            if (Number.isNaN(newMaxValue)) {
                setValidationError("Max value has to be a number.");
            } else if (maxValue !== null && Number(newMaxValue) > maxValue) {
                setValidationError(`Max value cannot be higher than ${maxValue}.`);
            } else if (isNonEmptyValue(value[0]) && Number(newMaxValue) < value[0]) {
                setValidationError("Max value cannot be lower than min value.");
            } else if (minValue !== null && Number(newMaxValue) < minValue) {
                setValidationError(`Min value cannot be lower than ${minValue}.`);
            } else {
                handleInputChange([value[0], Number(newMaxValue)]);
            }
        } else {
            handleInputChange([value[0], null]);
        }
    };

    const handleSliderChange = (event, val) => {
        if (val instanceof Array) {
            setDynamicSliderValue(val);
        } else if (value[0] === null) {
            setDynamicSliderValue([null, val]);
        } else {
            setDynamicSliderValue([val, null]);
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

    const renderInput = (inputValue, onInputChange, placeholder) => (
        <Input
            value={nonEmptyNumber(inputValue, "")}
            margin="dense"
            onChange={onInputChange}
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
        const val1 = nonEmptyNumber(dynamicSliderValue[0], null);
        const val2 = nonEmptyNumber(dynamicSliderValue[1], null);
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
            track={dynamicSliderValue[1] === null && isNonEmptyValue(dynamicSliderValue[0]) ? 'inverted' : 'normal'}
            onChange={handleSliderChange}
            onChangeCommitted={() => commitChange(dynamicSliderValue)}
            valueLabelDisplay="auto"
            aria-labelledby="range-slider"
            getAriaValueText={() => dynamicSliderValue}
            min={minValue}
            max={maxValue}
        />
    );

    return (
        <div>
            {minValue !== null && maxValue !== null ? (
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
            ) : (
                <Grid container spacing={3} alignItems="center" className={classes.numericalContent}>
                    <Grid item xs={6}>
                        {renderInput(value[0], handleMinValueInputChange, nonEmptyNumber(minValue, 'min'))}
                    </Grid>
                    <Grid item xs={6}>
                        {renderInput(value[1], handleMaxValueInputChange, nonEmptyNumber(maxValue, 'max'))}
                    </Grid>
                </Grid>
            )}
            <Typography color="error">
                {validationError}
            </Typography>
        </div>
    );
};

export default NumericalRangeSelectionFacet;
