import React from 'react';
import {connect} from 'react-redux';
import InformationDrawer from "../InformationDrawer/InformationDrawer";
import WithRightDrawer from "../../generic/WithRightDrawer/WithRightDrawer";
import {closeInfoDrawer} from "../../../actions/collectionbrowser";

const WithInfoDrawer = (props) => (
    <WithRightDrawer
        drawerContents={<InformationDrawer />}
        mainContents={props.children}
        drawerOpened={props.infoDrawerOpened}
        onCloseDrawer={props.closeInfoDrawer}
    />
);

const mapStateToProps = state => ({
    infoDrawerOpened: state.collectionBrowser.infoDrawerOpened
});

const mapDispatchToProps = {
    closeInfoDrawer
};

export default connect(mapStateToProps, mapDispatchToProps)(WithInfoDrawer);
