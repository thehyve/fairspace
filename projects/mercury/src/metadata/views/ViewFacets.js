/* eslint-disable no-unused-vars */
import React, {useContext, useEffect, useState} from 'react';
import _ from 'lodash';
import {useHistory} from "react-router-dom";
import {Button, Grid, Typography} from '@mui/material';
import {alpha} from '@mui/material/styles';
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

import CollectionsContext from "../../collections/CollectionsContext";
import {getParentPath, getPathFromIri} from "../../file/fileUtils";
import usePageTitleUpdater from "../../common/hooks/UsePageTitleUpdater";
import MetadataViewFacetsContext from "./MetadataViewFacetsContext";
import {accessLevelForCollection} from "../../collections/collectionUtils";

const styles = theme => ({
    confirmFiltersButtonBlock: {
        bottom: 0,
        marginTop: 8,
        marginLeft: 4,
        width: 253
    },
    confirmFiltersButtonBlockActive: {
        position: 'sticky',
        backgroundColor: alpha(theme.palette.common.white, 0.8)
    },
    confirmFiltersButton: {
        width: '100%'
    },
    facet: {
        borderColor: theme.palette.primary.light,
        borderWidth: 1.5,
        borderRadius: 6
    },
    facetHeaders: {
        textAlign: 'left',
        marginTop: 6,
        fontSize: 13,
        color: theme.palette.primary.light,
        marginLeft: 4
    }
});

export const ViewFacets = (props) => {
    const {views, filters, facetsEx, clearFilterCandidates, filterCandidates, updateFilterCandidates, handleClearFilter, applyFilters, classes} = props;

    const getFilterValues = (type: ValueType, filter: MetadataViewFilter): any[] => {
        if (ofRangeValueType(type)) {
            return [filter.min, filter.max];
        }
        if (ofBooleanValueType(type)) {
            return filter.booleanValue === null ? [] : [filter.booleanValue];
        }
        return filter.values;
    };

    const renderSingleFacet = (facet: MetadataViewFacet) => {
        const facetOptions = getFilterValues(facet.type, facet);
        const activeFilter = [...filterCandidates, ...filters].find(filter => filter.field === facet.name);
        let activeFilterValues = [];
        if (activeFilter) {
            activeFilterValues = getFilterValues(facet.type, activeFilter);
        }
        return facetOptions && facetOptions.length > 0 && (
            <Grid key={facet.name} item>
                <Facet
                    type={facet.type}
                    title={facet.title}
                    options={facetOptions}
                    onChange={(values) => updateFilterCandidates(facet, values)}
                    extraClasses={classes.facet}
                    activeFilterValues={activeFilterValues}
                    clearFilter={() => handleClearFilter(facet.name)}
                />
            </Grid>
        );
    };

    const renderFacets = (view: MetadataViewOptions) => {
        const viewFacets = facetsEx.filter(facet => (facet.name.toLowerCase().startsWith(view.name.toLowerCase())));
        return viewFacets.length > 0 && (
            <Grid key={view.name} container item direction="column" justifyContent="flex-start" spacing={1}>
                <div className={classes.facetHeaders} style={{textTransform: 'uppercase'}}>{view.title}</div>
                {
                    viewFacets.map(facet => renderSingleFacet(facet, filters, filterCandidates, updateFilterCandidates, handleClearFilter))
                }
                {
                    // location is the collection location, which we will group under resources
                    (view.name.toLowerCase() === 'resource') ? (
                        facetsEx
                            .filter(facet => facet.name.toLowerCase().startsWith('location'))
                            .map(facet => (renderSingleFacet(facet, filters, filterCandidates, updateFilterCandidates, handleClearFilter)))
                    ) : ""
                }
            </Grid>
        );
    };

    const renderFacetConfirmButtons = () => (
        <Grid
            container
            spacing={1}
            className={`${classes.confirmFiltersButtonBlock} ${filterCandidates.length > 0 && classes.confirmFiltersButtonBlockActive}`}
        >
            <Grid item xs={4}>
                <Button
                    onClick={clearFilterCandidates}
                    variant="contained"
                    className={classes.confirmFiltersButton}
                    disabled={filterCandidates.length === 0}
                >
                    Cancel
                </Button>
            </Grid>
            <Grid item xs={8}>
                <Button
                    onClick={applyFilters}
                    variant="contained"
                    color="secondary"
                    className={classes.confirmFiltersButton}
                    disabled={filterCandidates.length === 0}
                >
                    Apply filters
                </Button>
            </Grid>
        </Grid>
    );

    // eslint-disable-next-line
    console.log("FRANK03");
    // eslint-disable-next-line
    console.log(views);

    return (
        <Grid container item direction="column" justifyContent="flex-start" spacing={1}>
            {views.map(view => renderFacets(view))}
            {renderFacetConfirmButtons()}
        </Grid>
    );
};

export default withStyles(styles)(ViewFacets);
