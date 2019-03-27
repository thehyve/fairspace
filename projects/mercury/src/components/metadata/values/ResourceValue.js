import React from 'react';
import TextField from "@material-ui/core/TextField";

class ResourceValue extends React.Component {
    constructor(props) {
        super(props);

        this.state = {value: props.entry.id || ''};
    }

    handleChange = (e) => {
        const {value} = e.target;
        this.setState({value});
        this.props.onChange(value);
    }

    render() {
        const {property, style, onSave, ...otherProps} = this.props;

        return (
            <TextField
                {...otherProps}
                multiline={property.multiLine}
                value={this.state.value}
                onChange={this.handleChange}
                margin="normal"
                style={{...style, marginTop: 0, width: '100%'}}
                type="url"
            />
        );
    }
}

ResourceValue.defaultProps = {
    entry: {}
};

export default ResourceValue;
