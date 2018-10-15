import React from 'react';
import {connect} from 'react-redux';
import InformationDrawer from "../InformationDrawer/InformationDrawer";
import WithRightDrawer from "../../generic/WithRightDrawer/WithRightDrawer";
import {closeInfoDrawer} from "../../../actions/collectionbrowser";

const WithInfoDrawer = ({closeInfoDrawer, classes, infoDrawerOpened, children}) =>
    <WithRightDrawer
        drawerContents={<InformationDrawer/>}
        mainContents={children}
        drawerOpened={infoDrawerOpened}
        onCloseDrawer={closeInfoDrawer} />;

const mapStateToProps = (state) => {
    return {
        infoDrawerOpened: state.collectionBrowser.infoDrawerOpened
    }
};

const mapDispatchToProps = {
    closeInfoDrawer
};

export default connect(mapStateToProps, mapDispatchToProps)(WithInfoDrawer);



