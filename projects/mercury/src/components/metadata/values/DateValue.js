import React from 'react';
import {DatePicker} from "material-ui-pickers";
import {format} from 'date-fns';

class DateValue extends React.Component {
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
        const value = format(e, 'yyyy-MM-dd', {awareOfUnicodeTokens: true});
        this.props.onChange({value});
    }

    updateState = () => {
        this.setState({value: this.props.entry.value});
    }

    render() {
        const {entry, property, ...otherProps} = this.props;

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
