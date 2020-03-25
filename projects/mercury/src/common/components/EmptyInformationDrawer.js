import React from 'react';
import {Grid} from '@material-ui/core';
import AssignmentOutlined from '@material-ui/icons/AssignmentOutlined';
import MessageDisplay from './MessageDisplay';


const EmptyInformationDrawer = (props) => {
    const {message} = props;
    return (
        <Grid container direction="column" justify="center" alignItems="center">
            <Grid item>
                <AssignmentOutlined color="disabled" style={{fontSize: '4em'}} />
            </Grid>
            <Grid item>
                <MessageDisplay
                    message={message}
                    variant="h6"
                    withIcon={false}
                    isError={false}
                    messageColor="textSecondary"
                />
            </Grid>
        </Grid>
    );
};

EmptyInformationDrawer.defaultProps = {
    message: "Select an element to display its metadata"
};

export default EmptyInformationDrawer;
