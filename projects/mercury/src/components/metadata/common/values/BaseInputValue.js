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

        // Only store the new values if either
        // 1: the property allows only a single value (Not to add empty values to properties accepting multiple values)
        // 2: the new value is different from the old one
        // 3: the user has removed the existing value
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
