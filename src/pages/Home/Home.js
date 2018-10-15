import React from 'react';
import Typography from "@material-ui/core/Typography";
import WithRightDrawer from "../../components/generic/WithRightDrawer/WithRightDrawer";
import RecentActivity from "../../components/generic/RecentActivity/RecentActivity";

function Home(props) {
    return (
        <WithRightDrawer
            collapsible={false}
            mainContents={<Typography noWrap>{'You think water moves fast? You should see ice.'}</Typography>}
            drawerContents={<RecentActivity />} />
    );
}

export default (Home);



