import React, {useState} from 'react';
import Grid from '@material-ui/core/Grid';
import {usePageTitleUpdater} from "../common";

import * as consts from '../constants';
import {useSingleSelection} from "../file/UseSelection";
import {LoadingOverlay} from "../common/components";
import WorkspaceBrowser from "./WorkspaceBrowser";
import WorkspaceInformationDrawer from "./WorkspaceInformationDrawer";

const WorkspacePage = () => {
    usePageTitleUpdater('Workspaces');

    const [busy, setBusy] = useState(false);
    const {isSelected, toggle, selected} = useSingleSelection();

    return (
        <>
            <Grid container spacing={1}>
                <Grid item style={{width: consts.MAIN_CONTENT_WIDTH, maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT}}>
                    <WorkspaceBrowser
                        isSelected={workspace => isSelected(workspace.iri)}
                        toggleWorkspace={workspace => toggle(workspace.iri)}
                    />
                </Grid>
                <Grid item style={{width: consts.SIDE_PANEL_WIDTH}}>
                    <WorkspaceInformationDrawer
                        setBusy={setBusy}
                        selectedWorkspaceIri={selected}
                    />
                </Grid>
            </Grid>
            <LoadingOverlay loading={busy} />
        </>
    );
};

export default WorkspacePage;
