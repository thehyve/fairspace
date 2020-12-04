import React, {useEffect, useState} from 'react';
import Grid from "@material-ui/core/Grid";
import {KeyboardDatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';
import type {MetadataViewFacetProperties} from "../MetadataViewFacetFactory";
import {DATE_FORMAT} from "../../../constants";
import {formatDateTime} from "../../../common/utils/genericUtils";


const DateSelectionFacet = (props: MetadataViewFacetProperties) => {
    const {options = [], onChange = () => {}, classes, activeFilterValues} = props;
    const [value, setValue] = useState([null, null]);
    const [minDate, maxDate] = options;

    useEffect(() => {
        if (activeFilterValues.length > 0) {
            setValue(activeFilterValues);
        } else {
            setValue([null, null]);
        }
    }, [activeFilterValues]);

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

    const renderDatePicker = (selectedDate, handleDateChange, label, min, max, placeholderDate) => (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format={DATE_FORMAT}
                margin="normal"
                id={`date-picker-${label}`}
                label={label}
                value={selectedDate}
                onChange={handleDateChange}
                autoOk
                minDate={min || minDate}
                maxDate={max || maxDate}
                initialFocusedDate={placeholderDate}
                placeholder={formatDateTime(placeholderDate)}
                KeyboardButtonProps={{
                    'aria-label': 'change date',
                }}
                InputLabelProps={{
                    shrink: true
                }}
                InputProps={{
                    className: classes.input
                }}
            />
        </MuiPickersUtilsProvider>
    );

    return (
        <Grid container>
            <Grid item>
                {renderDatePicker(value[0], handleMinDateChange, "Start date", minDate, value[1], minDate)}
            </Grid>
            <Grid item>
                {renderDatePicker(value[1], handleMaxDateChange, "End date", value[0], maxDate, maxDate)}
            </Grid>
        </Grid>

    );
};

export default DateSelectionFacet;
