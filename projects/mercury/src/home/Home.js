import React, {useContext} from 'react';

import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import WorkspaceInfo from './WorkspaceInfo';
import UserList from "../users/UserList";
import WorkspaceContext from "../workspaces/WorkspaceContext";
import {currentWorkspace} from "../workspaces/workspaces";
import LinkedDataMetadataProvider from "../metadata/LinkedDataMetadataProvider";
import Collections from "../collections/CollectionsPage";
import LoadingInlay from "../common/components/LoadingInlay";
import MessageDisplay from "../common/components/MessageDisplay";
import BreadCrumbs from "../common/components/BreadCrumbs";

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

export default (props) => {
    const [value, setValue] = React.useState(0);
    const {workspaces, workspacesError, workspacesLoading} = useContext(WorkspaceContext);

    const workspace = workspaces.find(w => w.id === currentWorkspace());

    if (workspacesLoading) {
        return (<LoadingInlay />);
    }
    if (!workspace) {
        return (<MessageDisplay message="Workspace does not exist." />);
    }
    if (!workspace.canRead) {
        return (<MessageDisplay message="You don't have sufficient permissions to access the workspace." />);
    }
    if (workspacesError || !workspace.iri) {
        return (<MessageDisplay message="Error loading workspaces" />);
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                aria-label="workspace tabs"
            >
                <Tab label="Overview" {...a11yProps(0)} />
                <Tab label="Users" {...a11yProps(1)} />
                <Tab label="Collections" {...a11yProps(2)} />
            </Tabs>
            <TabPanel value={value} index={0}>
                <BreadCrumbs />
                <WorkspaceInfo workspace={workspace} />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <UserList workspace={workspace} />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <LinkedDataMetadataProvider>
                    <Collections history={props.history} workspaceIri={workspace.iri} />
                </LinkedDataMetadataProvider>
            </TabPanel>
        </>
    );
};
