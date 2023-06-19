// @ts-nocheck
import React from "react";
import { Grid } from "@mui/material";
import { Widgets } from "@mui/icons-material";
import usePageTitleUpdater from "../common/hooks/UsePageTitleUpdater";
import * as consts from "../constants";
import WorkspaceBrowser from "./WorkspaceBrowser";
import BreadCrumbs from "../common/components/BreadCrumbs";
import BreadcrumbsContext from "../common/contexts/BreadcrumbsContext";

const WorkspacesPage = () => {
  usePageTitleUpdater('Workspaces');
  return <BreadcrumbsContext.Provider value={{
    segments: [{
      label: 'Workspaces',
      icon: <Widgets />,
      href: '/workspaces'
    }]
  }}>
            <BreadCrumbs />
            <Grid container spacing={1}>
                <Grid item style={{
        maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT,
        maxWidth: '100%'
      }}>
                    <WorkspaceBrowser />
                </Grid>
            </Grid>
        </BreadcrumbsContext.Provider>;
};

export default WorkspacesPage;