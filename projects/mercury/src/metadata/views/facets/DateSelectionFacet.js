import React from 'react';

import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {KeyboardDatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';
import type {MetadataViewFacetProperties} from "../MetadataViewFacetFactory";
import {DATE_FORMAT} from "../../../constants";


const DateSelectionFacet = (props: MetadataViewFacetProperties) => {
    const {title, options = [], onChange = () => {}, classes} = props;
    const [value, setValue] = React.useState(options);
    const [minDate, maxDate] = options;

    const handleChange = (newValue) => {
        setValue(newValue);
        onChange(newValue);
    };

    const handleMinDateChange = (newValue) => {
        handleChange([newValue, value[1]]);
    };

    const handleMaxDateChange = (newValue) => {
        handleChange([value[0], newValue]);
    };

    const renderDatePicker = (selectedDate, handleDateChange, label, min, max) => (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format={`${DATE_FORMAT} hh:mm a`}
                margin="normal"
                id={`date-picker-${label}`}
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
        </MuiPickersUtilsProvider>
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
