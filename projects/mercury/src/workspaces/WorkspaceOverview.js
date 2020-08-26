import React, {useContext, useEffect, useState} from 'react';

import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import {Widgets} from '@material-ui/icons';
import WorkspaceInfo from './WorkspaceInfo';
import UserList from "../users/UserList";
import WorkspaceContext from "./WorkspaceContext";
import {currentWorkspace, workspacePrefix} from "./workspaces";
import LinkedDataMetadataProvider from "../metadata/LinkedDataMetadataProvider";
import Collections from "../collections/CollectionsPage";
import LoadingInlay from "../common/components/LoadingInlay";
import MessageDisplay from "../common/components/MessageDisplay";
import BreadCrumbs from "../common/components/BreadCrumbs";
import BreadcrumbsContext from '../common/contexts/BreadcrumbsContext';

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

const WorkspaceOverview = (props) => {
    const [selectedTab, setSelectedTab] = useState(0);
    const {workspaces, workspacesError, workspacesLoading} = useContext(WorkspaceContext);

    const [workspace, setWorkspace] = useState(workspaces.find(w => w.iri === currentWorkspace()));

    if (workspacesLoading) {
        return (<LoadingInlay />);
    }
    if (!workspace) {
        return (<MessageDisplay message="Workspace does not exist." />);
    }
    if (!workspace.canCollaborate) {
        return (<MessageDisplay message="You don't have sufficient permissions to access the workspace." />);
    }
    if (workspacesError || !workspace.iri) {
        return (<MessageDisplay message="Error loading workspace." />);
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const updated = workspaces.find(w => w.iri === currentWorkspace());
        if (updated && workspace !== updated) {
            setWorkspace(updated);
        }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [workspaces]);

    const changeTab = (event, tabIndex) => {
        setSelectedTab(tabIndex);
    };

    return (
        <BreadcrumbsContext.Provider value={{segments: [
            {
                label: 'Workspaces',
                icon: <Widgets />,
                href: '/workspaces'
            }
        ]}}
        >
            <BreadCrumbs additionalSegments={[{
                label: workspace.name,
                href: workspacePrefix()
            }]}
            />
            <Tabs
                value={selectedTab}
                onChange={changeTab}
                indicatorColor="primary"
                textColor="primary"
                aria-label="workspace tabs"
            >
                <Tab label="Overview" {...a11yProps(0)} />
                <Tab label="Users" {...a11yProps(1)} />
                <Tab label="Collections" {...a11yProps(2)} />
            </Tabs>
            <TabPanel value={selectedTab} index={0}>
                <WorkspaceInfo workspace={workspace} />
            </TabPanel>
            <TabPanel value={selectedTab} index={1}>
                <UserList workspace={workspace} />
            </TabPanel>
            <TabPanel value={selectedTab} index={2}>
                <LinkedDataMetadataProvider>
                    <Collections history={props.history} workspaceIri={workspace.iri} />
                </LinkedDataMetadataProvider>
            </TabPanel>
        </BreadcrumbsContext.Provider>
    );
};

export default WorkspaceOverview;
