import React from 'react';
import {useHistory} from "react-router-dom";
import {Layout} from '../common';
import {WorkspacesProvider} from '../workspaces/WorkspaceContext';
import WorkspaceListTopBar from "./WorkspaceListTopBar";
import WorkspaceListMenuItem from "./WorkspaceListMenuItem";
import {SearchPageContainer} from "../search/SearchPage";


const WorkspaceListSearchLayout = ({location: {pathname}}) => {
    const history = useHistory();
    return (
        <WorkspacesProvider>
            <Layout
                renderMenu={() => <WorkspaceListMenuItem />}
                renderMain={() => <SearchPageContainer location={pathname} history={history} />}
                renderTopbar={() => <WorkspaceListTopBar />}
            />
        </WorkspacesProvider>
    );
};

export default WorkspaceListSearchLayout;
