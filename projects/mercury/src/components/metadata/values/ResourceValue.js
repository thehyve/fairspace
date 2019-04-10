import React from 'react';
import TextField from "@material-ui/core/TextField";

class ResourceValue extends React.Component {
    constructor(props) {
        super(props);

        this.state = {value: props.entry.id, oldValue: props.entry.id};
    }

    componentDidUpdate(prevProps) {
        if (this.props.entry.value !== prevProps.entry.value) {
            this.reset();
        }
    }

    handleChange = (e) => {
        this.setState({value: e.target.value});
    }

    handleBlur = () => {
        try {
            this.props.onChange({id: new URL(this.state.value).toString()});
        } catch (e) {
            this.setState(prevState => ({value: prevState.oldValue}));
        }
    }

    render() {
        const {
            property, style, onSave, ...otherProps
        } = this.props;

        return (
            <TextField
                {...otherProps}
                multiline={property.multiLine}
                value={this.state.value}
                onChange={this.handleChange}
                onBlur={this.handleBlur}
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
