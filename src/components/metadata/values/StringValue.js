import React from 'react'
import TextField from "@material-ui/core/TextField";

class StringValue extends React.Component {
    constructor(props) {
        super(props);

        this.state = {value: props.entry.value};
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
            onBlur={() => onSave({value: this.state.value})}
            margin="normal"
            style={Object.assign(style || {}, {marginTop: 0, width: '100%'})}
        />
    }
}

StringValue.defaultProps = {
    entry: {value: ''}
};

export default StringValue;
