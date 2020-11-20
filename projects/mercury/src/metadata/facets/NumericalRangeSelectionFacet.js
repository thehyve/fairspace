import React from 'react';
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input";
import Slider from "@material-ui/core/Slider";
import {max, min} from "lodash/math";
import type {MetadataViewFacetProperties} from "../MetadataViewFacetFactory";


const NumericalRangeSelectionFacet = (props: MetadataViewFacetProperties) => {
    const {title, options = [], onChange = () => {}} = props;
    const minValue = min(options);
    const maxValue = max(options);
    const [value, setValue] = React.useState([null, null]);

    const handleChange = (newValue) => {
        setValue([min(newValue), max(newValue)]);
        onChange([min(newValue), max(newValue)]);
    };

    const handleSliderChange = (event, newValue) => {
        handleChange(newValue);
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
            <Typography id="range-slider" color="textSecondary" gutterBottom>
                {title}
            </Typography>
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
        </div>
    );
};

export default NumericalRangeSelectionFacet;
