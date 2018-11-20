import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';

class LoadingOverlay extends React.Component {

    render() {
        return (
            <Dialog open={this.props.loading}>
                <DialogTitle>Loading...</DialogTitle>
            </Dialog>
        );
    }
}

export default LoadingOverlay;
