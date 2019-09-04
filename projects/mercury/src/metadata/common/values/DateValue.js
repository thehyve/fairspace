import React from 'react';
import {DatePicker} from "material-ui-pickers";
import {format} from 'date-fns';

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
        const value = format(date, 'yyyy-MM-dd', {awareOfUnicodeTokens: true});
        this.props.onChange({value});
    }

    updateState = () => {
        this.setState({value: this.props.entry.value});
    }

    render() {
        const {entry, property, currentValues, ...otherProps} = this.props;

        return (
            <DatePicker
                {...otherProps}
                value={this.state.value}
                onChange={this.handleChange}
            />
        );
    }
}

DateValue.defaultProps = {
    entry: {value: undefined},
};

export default DateValue;
