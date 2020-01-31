import React from 'react';
import {BreadCrumbs} from "../common";

import WithRightDrawer from "../common/components/WithRightDrawer";
import RecentActivity from "./RecentActivity";
import Config from "../common/services/Config";
import WorkspaceInfo from './WorkspaceInfo';

export default () => (
    <>
        {
            Config.get().enableExperimentalFeatures
                ? (
                    <WithRightDrawer
                        collapsible={false}
                        mainContents={<BreadCrumbs />}
                        drawerContents={<RecentActivity />}
                    />
                )
                : <BreadCrumbs />
        }
        <WorkspaceInfo />
    </>
);
