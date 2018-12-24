import React from 'react';
import WithRightDrawer from "../../components/generic/WithRightDrawer/WithRightDrawer";
import RecentActivity from "../../components/generic/RecentActivity/RecentActivity";
import BreadCrumbs from "../../components/generic/BreadCrumbs/BreadCrumbs";
import Config from "../../services/Config/Config";

function Home() {
    return Config.get().enableExperimentalFeatures
        ? (
            <WithRightDrawer
                collapsible={false}
                mainContents={(
                    <>
                        <BreadCrumbs />
                    </>
                )}
                drawerContents={<RecentActivity />}
            />
        )
        : <BreadCrumbs />;
}

export default Home;
