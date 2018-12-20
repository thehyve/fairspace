import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import LoadingInlay from "./LoadingInlay";

const loadingOverlay = (props) => (
    <Dialog
        open={props.loading}
        PaperProps={{
            style: {
                backgroundColor: 'transparent',
                boxShadow: 'none',
            }
        }}
    >
        <LoadingInlay />
    </Dialog>
);

export default loadingOverlay;
