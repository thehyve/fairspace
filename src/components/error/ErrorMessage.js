import React from 'react';
import Icon from "@material-ui/core/Icon";
import Typography from "@material-ui/core/Typography";

/**
 * This component is displayed when an error has occurred.
 */
class ErrorMessage extends React.Component {
    static  instance;

    constructor(props) {
        super(props);
        this.props = props;
        this.message = props.message;
    }


    render() {
        return (<div>
            <Typography variant="subheading" color="error" align="justify" noWrap>
            <Icon>report_problem</Icon>
            <b>{this.message}</b>
            </Typography>
        </div>);
    }
}

export default ErrorMessage;
