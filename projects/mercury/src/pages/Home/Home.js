import React from 'react';
import WithRightDrawer from "../../components/generic/WithRightDrawer/WithRightDrawer";
import RecentActivity from "../../components/generic/RecentActivity/RecentActivity";
import asPage from "../../containers/asPage/asPage";
import BreadCrumbs from "../../components/generic/BreadCrumbs/BreadCrumbs";

function Home(props) {
    return (
        <WithRightDrawer
            collapsible={false}
            mainContents={<React.Fragment>
                <BreadCrumbs />
            </React.Fragment>}
            drawerContents={<RecentActivity />} />
    );
}

export default asPage(Home);



