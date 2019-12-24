import React from 'react';
import {BreadCrumbs, usePageTitleUpdater} from "../common";

import WithRightDrawer from "../common/components/WithRightDrawer";
import RecentActivity from "./RecentActivity";
import Config from "../common/services/Config";
import WorkspaceInfo from './WorkspaceInfo';

export default () => {
    usePageTitleUpdater("Home");

    return (
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
};
