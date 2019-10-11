import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import {LoadingInlay} from '@fairspace/shared-frontend';

const loadingOverlay = ({loading}) => (
    <Dialog
        open={loading || false}
        PaperProps={{
            style: {
                backgroundColor: 'transparent',
                boxShadow: 'none',
                overflow: 'hidden'
            }
        }}
    >
        <LoadingInlay />
    </Dialog>
);

export default loadingOverlay;
