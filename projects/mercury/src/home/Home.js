import React from 'react';
import {BreadCrumbs} from "@fairspace/shared-frontend";

import WithRightDrawer from "../common/components/WithRightDrawer";
import RecentActivity from "./RecentActivity";
import Config from "../common/services/Config";

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
