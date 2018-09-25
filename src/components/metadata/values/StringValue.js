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
        const {property} = this.props;

        return <TextField
            multiline={property.multiLine}
            value={this.state.value}
            onChange={this.handleChange.bind(this)}
            onBlur={() => this.props.onBlur(this.state.value)}
            margin="normal"
            style={{marginTop: 0}}
        />
    }
}

export default StringValue;
