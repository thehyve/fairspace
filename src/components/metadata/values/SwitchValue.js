import React from 'react'
import Switch from "@material-ui/core/Switch";

class StringValue extends React.Component {
    constructor(props) {
        super(props);

        this.state = {checked: !!props.entry.value};
    }

    handleChange(e) {
        this.setState({checked: e.target.checked});
        this.props.onSave({value: e.target.checked})
    }

    render() {
        const {entry, property, style, onSave, ...otherProps} = this.props;

        return <Switch
            {...otherProps}
            checked={this.state.checked}
            onChange={this.handleChange.bind(this)}
        />
    }
}

StringValue.defaultProps = {
    entry: {value: ''}
};

export default StringValue;
