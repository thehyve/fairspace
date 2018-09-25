import React from 'react'
import TextField from "@material-ui/core/TextField";

class StringValue extends React.Component {
    constructor(props) {
        super(props);
        const initialValue = props.entry ? props.entry.value || '' : '';
        this.state = {value: initialValue};
    }

    handleChange(e) {
        this.setState({value: e.target.value});
    }

    render() {
        const {entry, property, style, onSave, ...otherProps} = this.props;

        return <TextField
            {...otherProps}
            multiline={property.multiLine}
            value={this.state.value}
            onChange={this.handleChange.bind(this)}
            onBlur={() => this.props.onSave({value: this.state.value})}
            margin="normal"
            style={Object.assign(style || {}, {marginTop: 0})}
        />
    }
}

export default StringValue;
