import React from 'react';
import { Grid } from '@mui/material';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import MessageDisplay from './MessageDisplay';

const EmptyInformationDrawer = (props) => {
    const { message } = props;
    return (
        <Grid container direction="column" justifyContent="center" alignItems="center">
            <Grid item>
                <AssignmentOutlined color="disabled" style={{ fontSize: '4em' }} />
            </Grid>
            <Grid item>
                <MessageDisplay
                    message={message}
                    variant="h6"
                    withIcon={false}
                    isError={false}
                    noWrap={false}
                    messageColor="textSecondary"
                />
            </Grid>
        </Grid>
    );
};

EmptyInformationDrawer.defaultProps = {
    message: 'Select an element to display its metadata',
};

export default EmptyInformationDrawer;
