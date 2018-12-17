import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import LoadingInlay from "./LoadingInlay";

class LoadingOverlay extends React.Component {
    render() {
        return (
            <Dialog open={this.props.loading}>
                <LoadingInlay />
            </Dialog>
        );
    }
}

export default LoadingOverlay;
