import React from 'react';
import TextField from "@material-ui/core/TextField";

class DateTimeValue extends React.Component {
    constructor(props) {
        super(props);

        this.state = {value: props.entry.value};
    }

    handleChange(e) {
        this.setState({value: e.target.value});
    }

    handleSave() {
        this.props.onSave({value: this.delocalize(this.state.value)});
    }

    localize(dt) {
        return dt && dt.endsWith('Z') ? dt.substring(0, dt.length - 1) : dt;
    }

    delocalize(dt) {
        return dt ? `${dt}Z` : dt;
    }

    render() {
        const {
            entry, property, style, onSave, ...otherProps
        } = this.props;

        return (
            <TextField
                {...otherProps}
                multiline={false}
                value={this.localize(this.state.value)}
                type="datetime-local"
                onChange={this.handleChange.bind(this)}
                onBlur={this.handleSave.bind(this)}
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
