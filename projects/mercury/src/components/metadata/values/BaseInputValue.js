import React from 'react';
import TextField from "@material-ui/core/TextField";

class BaseInputValue extends React.Component {
    constructor(props) {
        super(props);

        this.state = {value: props.entry.value};
    }

    handleChange = (e) => {
        this.setState({value: e.target.value});
    }

    handleSave = () => {
        const {onSave, transformValue} = this.props;
        onSave({value: transformValue(this.state.value)});
    }

    render() {
        const {
            entry, property, style, onSave, transformValue, ...otherProps
        } = this.props;

        return (
            <TextField
                {...otherProps}
                multiline={property.multiLine}
                value={this.state.value}
                onChange={this.handleChange}
                onBlur={this.handleSave}
                margin="normal"
                style={{...style, marginTop: 0, width: '100%'}}
            />
        );
    }
}

BaseInputValue.defaultProps = {
    entry: {value: ''},
    transformValue: v => v
};

export default BaseInputValue;
