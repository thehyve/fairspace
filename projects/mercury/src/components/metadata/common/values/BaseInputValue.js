import React from 'react';
import TextField from "@material-ui/core/TextField";

class BaseInputValue extends React.Component {
    constructor(props) {
        super(props);

        this.state = {value: props.entry.value};
    }

    componentDidUpdate(prevProps) {
        if (this.props.entry.value !== prevProps.entry.value) {
            this.updateState();
        }
    }

    handleChange = (e) => {
        this.setState({value: e.target.value});
    }

    handleBlur = () => {
        const {onChange, transformValue, entry: {value: oldValue}} = this.props;
        const {value: newValue} = this.state;

        // only if values don't match OR if the inputted value is empty AND already had value (removed existing)
        if (transformValue(newValue) !== oldValue || (!transformValue(newValue) && oldValue)) {
            onChange({value: transformValue(newValue)});
            this.updateState();
        }
    }

    updateState = () => {
        this.setState({value: this.props.entry.value});
    }

    render() {
        const {entry, property, style, transformValue, ...otherProps} = this.props;

        return (
            <TextField
                {...otherProps}
                multiline={property.multiLine}
                value={this.state.value}
                onChange={this.handleChange}
                onBlur={this.handleBlur}
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
