import React from 'react';
import WithRightDrawer from "./common/WithRightDrawer";
import RecentActivity from "./RecentActivity";
import BreadCrumbs from "./common/BreadCrumbs";
import Config from "../services/Config/Config";

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
