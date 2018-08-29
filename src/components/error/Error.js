import React from 'react';


/**
 * This component is displayed when an error has occured.
 */
class Error extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.message = props.message;
    }

    render() {
        if (this.message){
            return (<div className={"Error"}>{this.message}</div>)
        }
        else{
            return (<div className={"Error"}>An error has occured</div>)
        }
    }

}

export default Error
