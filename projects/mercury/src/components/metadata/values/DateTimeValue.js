import React from 'react';
import {DateTimePicker} from "material-ui-pickers";

class DateTimeValue extends React.Component {
    constructor(props) {
        super(props);

        this.state = {value: props.entry.value || undefined};
    }

    componentDidUpdate(prevProps) {
        if (this.props.entry.value !== prevProps.entry.value) {
            this.updateState();
        }
    }

    handleChange = (e) => {
        this.props.onChange({value: e});
        this.setState({value: e});
    }

    updateState = () => {
        this.setState({value: this.props.entry.value});
    }

    render() {
        const {entry, property, ...otherProps} = this.props;

        return (
            <DateTimePicker
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
