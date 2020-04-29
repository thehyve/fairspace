import React from 'react';
import {withRouter} from "react-router-dom";
import {WorkspacesProvider} from '../workspaces/WorkspaceContext';
import WorkspaceListTopBar from "./WorkspaceListTopBar";
import SearchPage from "../search/SearchPage";
import Layout from "./Layout";


const WorkspaceListSearchLayout = ({location, history}) => (
    <WorkspacesProvider>
        <Layout
            renderMenu={() => <WorkspaceListMenuItem />}
            renderMain={() => <SearchPage location={location} history={history} />}
            renderTopbar={() => <WorkspaceListTopBar />}
        />
    </WorkspacesProvider>
);

export default withRouter(WorkspaceListSearchLayout);
