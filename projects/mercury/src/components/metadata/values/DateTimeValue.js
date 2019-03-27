import React from 'react';
import TextField from "@material-ui/core/TextField";

class DateTimeValue extends React.Component {
    constructor(props) {
        super(props);

        this.state = {value: props.entry.value || ''};
    }

    handleChange = (e) => {
        const {value} = e.target;
        this.setState({value: this.localize(value)});
        this.props.onChange(this.delocalize(value));
    }

    localize = (dt) => (dt && dt.endsWith('Z') ? dt.substring(0, dt.length - 1) : dt);

    delocalize = (dt) => (dt ? `${dt}Z` : dt);

    render() {
        const {entry, property, style, onSave, ...otherProps} = this.props;

        return (
            <TextField
                {...otherProps}
                multiline={false}
                value={this.state.value}
                type="datetime-local"
                onChange={this.handleChange}
                margin="normal"
                style={{...style, marginTop: 0, width: '100%'}}
            />
        );
    }
}

DateTimeValue.defaultProps = {
    entry: {}
};

export default DateTimeValue;
