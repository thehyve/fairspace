import React from 'react';
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input";
import Slider from "@material-ui/core/Slider";
import type {MetadataViewFacetProperties} from "../MetadataViewFacetFactory";


const NumericalRangeSelectionFacet = (props: MetadataViewFacetProperties) => {
    const {title, options = [], onChange = () => {}} = props;
    const min = options[0];
    const max = options[1];
    const [value, setValue] = React.useState(options);

    const handleChange = (newValue) => {
        setValue(newValue);
        onChange(newValue);
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
        if (value[0] < min) {
            handleChange([min, value[1]]);
        } else if (value[1] > max) {
            handleChange([value[0], max]);
        }
    };

    const renderInput = (inputValue, handleInputChange) => (
        <Input
            value={inputValue}
            margin="dense"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
                'step': 1,
                min,
                max,
                'type': 'number',
                'aria-labelledby': 'input-slider',
            }}
        />
    );

    const renderSlider = () => (
        <Slider
            value={value}
            onChange={handleSliderChange}
            valueLabelDisplay="auto"
            aria-labelledby="range-slider"
            getAriaValueText={() => value}
            min={options[0]}
            max={options[1]}
        />
    );

    return (
        <div>
            <Typography id="range-slider" color="textSecondary" gutterBottom>
                {title}
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item>
                    {renderInput(value[0], handleMinValueInputChange)}
                </Grid>
                <Grid item xs>
                    {renderSlider()}
                </Grid>
                <Grid item>
                    {renderInput(value[1], handleMaxValueInputChange)}
                </Grid>
            </Grid>
        </div>
    );
};

export default NumericalRangeSelectionFacet;
