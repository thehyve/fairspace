import React, {useState} from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import Grid from '@mui/material/Grid';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {format} from 'date-fns';
import TextField from '@mui/material/TextField';
import type {MetadataViewFacetProperties} from '../MetadataViewFacetFactory';
import {DATE_FORMAT} from '../../../constants';

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

    useDeepCompareEffect(() => {
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
        // lib.es5 Date constructor (used in the getRangeLimit method) converts two-digits (XX) input year to 1900+XX.
        // For instance, 68 turns to 1900 + 68 -> 1968.
        // Thus, only 4 digits year are considered as valid.
        const fourDigitsYearEntered = val.getFullYear().toString().length === 4;
        return val >= minDate && val <= maxDate && fourDigitsYearEntered;
    };

    const isValidInterval = (startDate: Date, endDate: Date): boolean =>
        !startDate || !endDate || startDate <= endDate;

    const handleChange = newDateInterval => {
        if (isValidInterval(newDateInterval)) {
            onChange(newDateInterval);
        }
    };

    const handleMinDateChange = newValue => {
        const oldEndDate = value[1];
        setValue([newValue, oldEndDate]);
        if (isValid(newValue)) {
            const newDateInterval = [getRangeLimit(newValue), oldEndDate];
            handleChange(newDateInterval);
        }
    };

    const handleMaxDateChange = newValue => {
        const oldStartDate = value[0];
        setValue([oldStartDate, newValue]);
        if (isValid(newValue)) {
            const newDateInterval = [oldStartDate, getRangeLimit(newValue, true)];
            handleChange(newDateInterval);
        }
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
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
                disableToolbar
                variant="inline"
                inputFormat={DATE_FORMAT}
                invalidDateMessage="Invalid date format"
                margin="normal"
                label={label}
                value={selectedDate}
                onChange={handleDateChange}
                autoOk
                minDate={min || minDate}
                maxDate={max || maxDate}
                defaultCalendarMonth={placeholderDate}
                placeholder={renderDate(placeholderDate)}
                KeyboardButtonProps={{
                    'aria-label': 'change date'
                }}
                InputLabelProps={{
                    shrink: true
                }}
                InputProps={{
                    className: classes.input
                }}
                renderInput={params => <TextField {...params} />}
            />
        </LocalizationProvider>
    );

    return (
        <Grid container>
            <Grid item>
                {renderDatePicker(
                    value[0],
                    handleMinDateChange,
                    'Start date',
                    minDate,
                    value[1],
                    minDate
                )}
            </Grid>
            <Grid item>
                {renderDatePicker(
                    value[1],
                    handleMaxDateChange,
                    'End date',
                    value[0],
                    maxDate,
                    maxDate
                )}
            </Grid>
        </Grid>
    );
};

export default DateSelectionFacet;
