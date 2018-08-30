import React from 'react';


/**
 * This component is displayed when an error has occurred.
 */
class ErrorDialog extends React.Component {
    static  instance;

    constructor(props) {
        super(props);
        this.props = props;
        this.message = props.errorMessage;
        this.state = {
            error: false,
            info: null
        };
        ErrorDialog.instance = this;
    }

    static showError(error, message, type) {
        console.error(message, error);
        if (ErrorDialog.instance) {
            ErrorDialog.instance.setState({error: error, message: message, type: type})
        }
    }

    componentDidCatch(error, info) {
        ErrorDialog.showError(error, error.message);
    }

    render() {
        if (this.state.error){
            return (<div>{this.state.message}</div>)
        }
        return this.props.children;
    }

}

export default ErrorDialog
