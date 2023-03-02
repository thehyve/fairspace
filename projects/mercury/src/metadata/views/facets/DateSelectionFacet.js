/* eslint-disable */
import React, {useEffect, useState} from 'react';
import Grid from "@mui/material/Grid";
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {format} from 'date-fns';
import TextField from '@mui/material/TextField';
import type {MetadataViewFacetProperties} from "../MetadataViewFacetFactory";
import {DATE_FORMAT} from "../../../constants";

const DateSelectionFacet = (props: MetadataViewFacetProperties) => {
    const {options = [], onChange = () => {}, clearFilter = () => {}, classes, activeFilterValues} = props;
    const [beginDate, setBeginDate] = React.useState(null);
    const [endDate, setEndDate] = React.useState(null);
    const [minDateOption, maxDateOption] = options;
    const minDate = minDateOption;
    const maxDate = getEndDate(maxDateOption);

    useEffect(() => {
        if (activeFilterValues.length > 0) {
            setBeginDate(activeFilterValues[0]);
            setEndDate(activeFilterValues[1]);
        } else {
            setBeginDate(null);
            setEndDate(null);
        }
    }, [activeFilterValues]);

    const handleMinDateChange = (newValue, textInput) => {
        if(textInput && textInput.length > 0 && textInput.length < 10) {
            // user is not finished typing
            return;
        }

        setBeginDate(newValue);
        onChange([newValue, endDate]);
    };

    const handleMaxDateChange = (newValue, textInput) => {
        if(textInput && textInput.length > 0 && textInput.length < 10) {
            // user is not finished typing
            return;
        }

        const newEndDate = getEndDate(newValue);
        setEndDate(newEndDate);
        onChange([beginDate, newEndDate]);
    };

    function getEndDate(val: any): Date {
        if (!val) {
            return null;
        }
        const date = new Date(val);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    }

    const renderDatePicker = (selectedDate, handleDateChange, label, min, max) => (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
                label={label}
                value={selectedDate}
                onChange={handleDateChange}
                minDate={min || minDate}
                maxDate={max || maxDate}
                renderInput={(params) => <TextField {...params} />}
            />
        </LocalizationProvider>
    );

    return (
        <Grid container>
            <Grid item>
                {renderDatePicker(beginDate, handleMinDateChange, "Start date", minDate, maxDate)}
            </Grid>
            <Grid item>
                {renderDatePicker(endDate, handleMaxDateChange, "End date", minDate, maxDate)}
            </Grid>
        </Grid>

    );
};

export default DateSelectionFacet;
