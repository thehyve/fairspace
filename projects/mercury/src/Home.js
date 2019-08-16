import React from 'react';

import WithRightDrawer from "./common/components/WithRightDrawer";
import RecentActivity from "./RecentActivity";
import Config from "./common/services/Config/Config";
import BreadCrumbs from "./common/components/breadcrumbs/BreadCrumbs";

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
