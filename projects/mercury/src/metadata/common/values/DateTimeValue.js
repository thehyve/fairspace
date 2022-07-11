import React from 'react';
import {DateTimePicker} from "@material-ui/pickers";
import {DATE_FORMAT} from '../../../constants';

class DateTimeValue extends React.Component {
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
        this.props.onChange({value: date});
    };

    updateState = () => {
        this.setState({value: this.props.entry.value});
    };

    render() {
        const {entry, property, currentValues, ...otherProps} = this.props;

        return (
            <DateTimePicker
                showTodayButton
                openTo="year"
                format={`${DATE_FORMAT} HH:mm`}
                views={["year", "month", "date", "hours", "minutes"]}
                {...otherProps}
                value={this.state.value}
                onChange={this.handleChange}
            />
        );
    }
}

DateTimeValue.defaultProps = {
    entry: {value: undefined},
};

export default DateTimeValue;
