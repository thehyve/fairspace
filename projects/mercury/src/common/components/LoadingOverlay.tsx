import React from 'react';
import Dialog from '@mui/material/Dialog';
import LoadingInlay from './LoadingInlay';

const LoadingOverlay = ({loading}) => (
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

export default LoadingOverlay;
