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
        const {onChange, entry: {value: oldValue}, property} = this.props;
        const {value: newValue} = this.state;

        // only if one of these apply (This is mainly to avoid adding multiple empty strings):
        // 1: the property allows only single value (to enforce validation on empty strings)
        // 2: values don't match
        // 3: the inputted value is empty AND already had value (removed existing)
        if (property.maxValuesCount === 1 || newValue !== oldValue || (!newValue && oldValue)) {
            onChange({value: newValue});
            this.updateState();
        }
    }

    updateState = () => {
        this.setState({value: this.props.entry.value});
    }

    render() {
        const {entry, property, style, ...otherProps} = this.props;

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
    entry: {value: ''}
};

export default BaseInputValue;
