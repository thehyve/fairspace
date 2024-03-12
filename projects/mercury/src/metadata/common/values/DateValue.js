import React from 'react';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {TextField} from '@mui/material';
import {format} from 'date-fns';

import {DATE_FORMAT} from '../../../constants';

class DateValue extends React.Component {
    constructor(props) {
        super(props);

        this.state = {value: props.entry.value || null};
    }

    componentDidUpdate(prevProps) {
        if (this.props.entry.value !== prevProps.entry.value) {
            this.updateState();
        }
    }

    handleChange = (date) => {
        // Formatting is required because the backend expect the date with no time
        const value = date && format(date, 'yyyy-MM-dd', {awareOfUnicodeTokens: true});
        this.props.onChange({value});
    };

    updateState = () => {
        this.setState({value: this.props.entry.value});
    };

    render() {
        return (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    inputFormat={DATE_FORMAT}
                    invalidDateMessage="Invalid date format"
                    value={this.state.value}
                    onChange={this.handleChange}
                    renderInput={(params) => <TextField {...params} />}
                />
            </LocalizationProvider>
        );
    }
}

DateValue.defaultProps = {
    entry: {value: undefined},
};

export default DateValue;
