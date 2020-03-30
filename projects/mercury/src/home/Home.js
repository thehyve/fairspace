import React, {useContext} from 'react';

import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import {BreadCrumbs} from "../common";
import WorkspaceInfo from './WorkspaceInfo';
import UserList from "../users/UserList";
import WorkspaceContext from "../workspaces/WorkspaceContext";
import {currentWorkspace} from "../workspaces/workspaces";

export const TabPanel = (props) => {
    const {children, value, index, ...other} = props;

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`workspace-tabpanel-${index}`}
            aria-labelledby={`workspace-tab-${index}`}
            {...other}
        >
            {value === index && <Box p={3}>{children}</Box>}
        </Typography>
    );
};

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

const a11yProps = (index) => ({
    'id': `workspace-tab-${index}`,
    'aria-controls': `workspace-tabpanel-${index}`,
});

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
}));

export default () => {
    const classes = useStyles();
    const [value, setValue] = React.useState(0);
    const {workspaces, workspacesError, workspacesLoading} = useContext(WorkspaceContext);
    const id = currentWorkspace();
    const ws = workspaces.find(w => w.id === id);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <div className={classes.root}>
            <AppBar position="static" color="default">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    aria-label="workspace tabs"
                >
                    <Tab label="Overview" {...a11yProps(0)} />
                    <Tab label="Users" {...a11yProps(1)} />
                </Tabs>
            </AppBar>
            <TabPanel value={value} index={0}>
                <BreadCrumbs />
                <WorkspaceInfo workspace={ws} workspacesError={workspacesError} workspacesLoading={workspacesLoading} />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <UserList workspace={ws} workspacesError={workspacesError} workspacesLoading={workspacesLoading} />
            </TabPanel>
        </div>
    );
};
