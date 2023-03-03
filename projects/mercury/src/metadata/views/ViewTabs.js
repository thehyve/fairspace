/* eslint-disable no-unused-vars */
import React, {useContext, useEffect, useState} from 'react';
import _ from 'lodash';
import {useHistory} from "react-router-dom";
import {Button, Grid, Typography} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {Assignment, Close} from "@mui/icons-material";
import Facet from './MetadataViewFacetFactory';
import type {MetadataViewFacet, MetadataViewFilter, MetadataViewOptions, ValueType} from "./MetadataViewAPI";
import BreadCrumbs from '../../common/components/BreadCrumbs';
import MetadataViewContext from "./MetadataViewContext";
import BreadcrumbsContext from "../../common/contexts/BreadcrumbsContext";
import {getLocationContextFromString, getMetadataViewNameFromString} from "../../search/searchUtils";
import type {MetadataViewEntity} from "./metadataViewUtils";
import {getMetadataViewsPath, ofBooleanValueType, ofRangeValueType, RESOURCES_VIEW} from "./metadataViewUtils";
import MetadataViewActiveFacetFilters from "./MetadataViewActiveFacetFilters";
import MetadataViewInformationDrawer from "./MetadataViewInformationDrawer";
import {useSingleSelection} from "../../file/UseSelection";
import {TabPanel} from "../../workspaces/WorkspaceOverview";
import LoadingInlay from "../../common/components/LoadingInlay";
import MessageDisplay from "../../common/components/MessageDisplay";
import MetadataViewTableContainer from "./MetadataViewTableContainer";
import * as consts from "../../constants";

import CollectionsContext from "../../collections/CollectionsContext";
import {getParentPath, getPathFromIri} from "../../file/fileUtils";
import usePageTitleUpdater from "../../common/hooks/UsePageTitleUpdater";
import MetadataViewFacetsContext from "./MetadataViewFacetsContext";
import {accessLevelForCollection} from "../../collections/collectionUtils";

const styles = theme => ({
    metadataViewTabs: {
        marginTop: 10,
        overflowX: 'auto',
        width: '100%',
        overflowY: 'hidden',
        maxHeight: consts.MAIN_CONTENT_MAX_HEIGHT,
    },
    tabsPanel: {
        paddingRight: 70
    },
    tab: {
        '& .MuiBox-root': {
            padding: 0,
        },
    }
});

const a11yProps = (index) => ({
    'key': `metadata-view-tab-${index}`,
    'aria-controls': `metadata-view-tab-${index}`,
});

const appendCustomColumns = (view: MetadataViewOptions) => {
    if (view.name === RESOURCES_VIEW) {
        const pathColumn = {title: "Path", name: "path", type: "Custom"};
        const accessColumn = {title: "Access", name: "access", type: "Custom"};
        return [
            view.columns.find(c => c.name === RESOURCES_VIEW),
            pathColumn,
            ...view.columns.filter(c => c.name !== RESOURCES_VIEW),
            accessColumn
        ];
    }
    return view.columns;
};

export const ViewTabs = (props) => {
    const {currentViewIndex, changeTab, views, filters, locationContext, selected, toggleRow, filterCandidates, collections} = props;
    const {textFiltersObject, setTextFiltersObject} = props;
    return (
        <div>
            <Tabs
                value={currentViewIndex}
                onChange={changeTab}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                aria-label="metadata view tabs"
                className={styles.tabsPanel}
            >
                {views.map((view, index) => (
                    <Tab label={view.title} {...a11yProps(index)} />
                ))}
            </Tabs>
            {views.map((view, index) => (
                <TabPanel value={currentViewIndex} index={index} {...a11yProps(index)} className={styles.tab}>
                    <MetadataViewTableContainer
                        columns={appendCustomColumns(view)}
                        view={view.name}
                        filters={filters}
                        locationContext={locationContext}
                        selected={selected}
                        toggleRow={toggleRow}
                        hasInactiveFilters={filterCandidates.length > 0}
                        collections={collections}
                        textFiltersObject={textFiltersObject}
                        setTextFiltersObject={setTextFiltersObject}
                    />
                </TabPanel>
            ))}
        </div>
    );
};

export default withStyles(styles)(ViewTabs);
