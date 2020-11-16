import React from 'react';

import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {KeyboardDatePicker} from "@material-ui/pickers";
import type {MetadataViewFacetProperties} from "../MetadataViewFacetFactory";


const DateSelectionFacet = (props: MetadataViewFacetProperties) => {
    const {title, options = [], onChange = () => {}, classes} = props;
    const [value, setValue] = React.useState(options.map(o => o.toLocaleString()));
    const [minDate, maxDate] = options;

    const handleChange = (newValue) => {
        setValue(newValue);
        onChange(newValue);
    };

    const handleMinDateChange = (newValue) => {
        handleChange([newValue.toLocaleString(), value[1]]);
    };

    const handleMaxDateChange = (newValue) => {
        handleChange([value[0], newValue.toLocaleString()]);
    };

    const renderDatePicker = (selectedDate, handleDateChange, label, min, max) => (
        <KeyboardDatePicker
            disableToolbar
            variant="inline"
            format="dd/MM/yyyy"
            margin="normal"
            id="date-picker-inline"
            label={label}
            value={selectedDate}
            onChange={handleDateChange}
            autoOk
            minDate={min}
            maxDate={max}
            KeyboardButtonProps={{
                'aria-label': 'change date',
            }}
        />
    );

    return (
        <div>
            <Typography color="textSecondary" id="date-selection" gutterBottom className={classes.title}>
                {title}
            </Typography>
            <Grid container>
                <Grid item>
                    {renderDatePicker(value[0], handleMinDateChange, "Start date", minDate, value[1])}
                </Grid>
                <Grid item>
                    {renderDatePicker(value[1], handleMaxDateChange, "End date", value[0], maxDate)}
                </Grid>
            </Grid>
        </div>
    );
};

export default DateSelectionFacet;
