import React from 'react';
import WithRightDrawer from "./common/WithRightDrawer";
import RecentActivity from "./RecentActivity";
import Config from "../services/Config/Config";
import BreadCrumbs from "./common/BreadCrumbs";

const breadCrumbSegments = [{
    label: 'Home',
    icon: 'home',
    href: '/'
}];

export default () => (
    Config.get().enableExperimentalFeatures
        ? (
            <WithRightDrawer
                collapsible={false}
                mainContents={<BreadCrumbs segments={breadCrumbSegments} />}
                drawerContents={<RecentActivity />}
            />
        )
        : <BreadCrumbs segments={breadCrumbSegments} />
);
