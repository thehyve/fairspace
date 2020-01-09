import React from 'react';
import Grid from '@material-ui/core/Grid';
import {usePageTitleUpdater} from "../common";

import * as consts from '../constants';
import ProjectBrowser from './ProjectBrowser';

const ProjectsPage = () => {
    usePageTitleUpdater('Projects');

    return (
        <>
            <Grid container spacing={1}>
                <Grid item style={{width: consts.MAIN_CONTENT_WIDTH, maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT}}>
                    <ProjectBrowser />
                </Grid>
            </Grid>
        </>
    );
};

export default ProjectsPage;
