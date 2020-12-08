import React, {useEffect, useState} from 'react';
import Grid from "@material-ui/core/Grid";
import {KeyboardDatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';
import {format} from 'date-fns';
import type {MetadataViewFacetProperties} from "../MetadataViewFacetFactory";
import {DATE_FORMAT} from "../../../constants";

const getRangeLimit = (val: any, end: boolean = false): Date => {
    if (!val) {
        return null;
    }
    const date = new Date(val);
    return end
        ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
        : new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const DateSelectionFacet = (props: MetadataViewFacetProperties) => {
    const {options = [], onChange = () => {}, classes, activeFilterValues} = props;
    const [value, setValue] = useState([null, null]);
    const [minDateOption, maxDateOption] = options;
    const minDate = getRangeLimit(minDateOption);
    const maxDate = getRangeLimit(maxDateOption, true);

    useEffect(() => {
        if (activeFilterValues.length > 0) {
            setValue(activeFilterValues);
        } else {
            setValue([null, null]);
        }
    }, [activeFilterValues]);

    const isValid = (val: Date | null): boolean => {
        if (val === null) {
            return true;
        }
        if (val.toString() === 'Invalid Date') {
            return false;
        }
        return (val >= minDate && val <= maxDate);
    };

    const handleChange = (newValue) => {
        if (value !== newValue) {
            setValue(newValue);
            if (isValid(newValue[0]) && isValid(newValue[1])) {
                onChange(newValue);
            } else {
                onChange(null);
            }
        }
    };

    const handleMinDateChange = (newValue) => {
        handleChange([getRangeLimit(newValue), value[1]]);
    };

    const handleMaxDateChange = (newValue) => {
        handleChange([value[0], getRangeLimit(newValue, true)]);
    };

    const renderDate = (val: any): string => {
        if (!val) {
            return '';
        }
        try {
            return format(val, DATE_FORMAT);
        } catch (e) {
            return '';
        }
    };

    const renderDatePicker = (selectedDate, handleDateChange, label, min, max, placeholderDate) => (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format={DATE_FORMAT}
                invalidDateMessage="Invalid date format"
                margin="normal"
                label={label}
                value={selectedDate}
                onChange={handleDateChange}
                autoOk
                minDate={min || minDate}
                maxDate={max || maxDate}
                initialFocusedDate={placeholderDate}
                placeholder={renderDate(placeholderDate)}
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
