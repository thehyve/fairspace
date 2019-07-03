import React from 'react';
import WithRightDrawer from "./common/WithRightDrawer";
import RecentActivity from "./RecentActivity";
import Config from "../services/Config/Config";
import BreadCrumbs from "./common/breadcrumbs/BreadCrumbs";

export default () => (
    Config.get().enableExperimentalFeatures
        ? (
            <WithRightDrawer
                collapsible={false}
                mainContents={<BreadCrumbs />}
                drawerContents={<RecentActivity />}
            />
        )
        : <BreadCrumbs />
);
