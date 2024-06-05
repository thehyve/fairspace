import React from 'react';
import withStyles from '@mui/styles/withStyles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import type {MetadataViewOptions, MetadataViewFilter, MetadataViewColumn} from './MetadataViewAPI';
import {RESOURCES_VIEW} from './metadataViewUtils';
import {TabPanel} from '../../workspaces/WorkspaceOverview';
import MetadataViewTableContainer from './MetadataViewTableContainer';
import CollectionsContext from '../../collections/CollectionsContext';

type MetadataViewTabsProperties = {
    currentViewIndex: Number,
    idColumn: MetadataViewColumn,
    changeTab: () => {},
    views: MetadataViewOptions[],
    filters: MetadataViewFilter[],
    locationContext: string,
    selected: [],
    toggleRow: () => [],
    hasInactiveFilters: Boolean,
    collections: CollectionsContext,
    classes: any
};

const styles = theme => ({
    tabsPanel: {
        paddingRight: 70,
        '& .MuiButtonBase-root': {
            borderRadius: 30
        }
    },
    tab: {
        '& .MuiBox-root': {
            padding: 0,
            borderRadius: theme.shape.borderRadius
        }
    }
});

export const MetadataViewTabs = (props: MetadataViewTabsProperties) => {
    const {
        currentViewIndex,
        idColumn,
        changeTab,
        views,
        filters,
        locationContext,
        selected,
        toggleRow,
        hasInactiveFilters,
        collections,
        classes
    } = props;
    const {textFiltersObject, setTextFiltersObject} = props;

    const a11yProps = index => ({
        key: `metadata-view-tab-${index}`,
        'aria-controls': `metadata-view-tab-${index}`
    });

    const appendCustomColumns = (view: MetadataViewOptions) => {
        if (view.name === RESOURCES_VIEW) {
            const pathColumn = {title: 'Path', name: 'path', type: 'Custom'};
            const accessColumn = {title: 'Access', name: 'access', type: 'Custom'};
            return [
                view.columns.find(c => c.name === RESOURCES_VIEW),
                pathColumn,
                ...view.columns.filter(c => c.name !== RESOURCES_VIEW),
                accessColumn
            ];
        }
        return view.columns.sort((a, b) => a.displayIndex - b.displayIndex);
    };

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
                className={classes.tabsPanel}
            >
                {views.map((view, index) => (
                    <Tab label={view.title} {...a11yProps(index)} />
                ))}
            </Tabs>
            {views.map((view, index) => (
                <TabPanel value={currentViewIndex} index={index} {...a11yProps(index)} className={classes.tab}>
                    <MetadataViewTableContainer
                        columns={appendCustomColumns(view)}
                        idColumn={idColumn}
                        view={view.name}
                        filters={filters}
                        locationContext={locationContext}
                        selected={selected}
                        toggleRow={toggleRow}
                        hasInactiveFilters={hasInactiveFilters}
                        collections={collections}
                        textFiltersObject={textFiltersObject}
                        setTextFiltersObject={setTextFiltersObject}
                    />
                </TabPanel>
            ))}
        </div>
    );
};

export default withStyles(styles)(MetadataViewTabs);
