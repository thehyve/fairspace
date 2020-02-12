import React from 'react';
import {withRouter} from "react-router-dom";
import {Layout} from '../common';
import {WorkspacesProvider} from '../workspaces/WorkspaceContext';
import WorkspaceListTopBar from "./WorkspaceListTopBar";
import WorkspaceListMenuItem from "./WorkspaceListMenuItem";
import SearchPage from "../search/SearchPage";


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
