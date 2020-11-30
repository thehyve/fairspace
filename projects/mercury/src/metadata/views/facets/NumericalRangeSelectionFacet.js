import React, {useEffect, useState} from 'react';
import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input";
import Slider from "@material-ui/core/Slider";
import {max, min} from "lodash/math";
import type {MetadataViewFacetProperties} from "../MetadataViewFacetFactory";

const INPUT_CHANGE_DELAY = 250; // in milliseconds

const NumericalRangeSelectionFacet = (props: MetadataViewFacetProperties) => {
    const {options = [], onChange = () => {}, preselected} = props;
    const minValue = min(options) != null ? min(options) : -1;
    const maxValue = max(options) != null ? max(options) : -1;
    const [value, setValue] = useState([null, null]);
    const [timeoutId, setTimeoutId] = useState();

    useEffect(() => setValue([null, null]), [preselected]);

    const handleChange = (val: number[]) => {
        clearTimeout(timeoutId);
        setValue([min(val), max(val)]);
        setTimeoutId(setTimeout(() => onChange([min(val), max(val)]), INPUT_CHANGE_DELAY));
    };

    const handleSliderChange = (event, val) => {
        handleChange(val);
    };

    const handleMinValueInputChange = (event) => {
        const newMinValue = event.target.value === '' ? '' : Number(event.target.value);
        handleChange([newMinValue, value[1]]);
    };

    const handleMaxValueInputChange = (event) => {
        const newMaxValue = event.target.value === '' ? '' : Number(event.target.value);
        handleChange([value[0], newMaxValue]);
    };

    const handleBlur = () => {
        if (value[0] && value[0] < minValue) {
            handleChange([minValue, value[1]]);
        } else if (value[1] && value[1] > maxValue) {
            handleChange([value[0], maxValue]);
        }
    };

    const renderInput = (inputValue, handleInputChange, placeholder) => (
        <Input
            value={inputValue === null ? '' : inputValue}
            margin="dense"
            onChange={handleInputChange}
            onBlur={handleBlur}
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

    const renderSlider = () => (
        <Slider
            value={[value[0] || minValue, value[1] || maxValue]}
            onChangeCommitted={handleSliderChange}
            valueLabelDisplay="auto"
            aria-labelledby="range-slider"
            getAriaValueText={() => value}
            min={minValue}
            max={maxValue}
        />
    );

    return (
        <Grid container spacing={2} alignItems="center">
            <Grid item>
                {renderInput(value[0], handleMinValueInputChange, minValue)}
            </Grid>
            <Grid item xs>
                {renderSlider()}
            </Grid>
            <Grid item>
                {renderInput(value[1], handleMaxValueInputChange, maxValue)}
            </Grid>
        </Grid>
    );
};

export default NumericalRangeSelectionFacet;
