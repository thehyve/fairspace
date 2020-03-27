// @flow
import React, {useContext} from 'react';
import {ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography, withStyles} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {withRouter} from 'react-router-dom';

import styles from '../common/components/InformationDrawer.styles';
import CollectionDetails from "./CollectionDetails";
import PathMetadata from "../metadata/metadata/PathMetadata";
import CollectionsContext from "../common/contexts/CollectionsContext";
import {LinkedDataEntityFormWithLinkedData} from '../metadata/common/LinkedDataEntityFormContainer';
import type {Collection} from './CollectionAPI';
import EmptyInformationDrawer from "../common/components/EmptyInformationDrawer";

const pathHierarchy = (fullPath) => {
    if (!fullPath) return [];

    const paths = [];
    let path = fullPath;
    while (path && path.lastIndexOf('/') > 0) {
        paths.push(path);
        path = path.substring(0, path.lastIndexOf('/'));
    }
    return paths.reverse();
};

type CollectionInformationDrawerProps = {
    classes: any;
    path: string;
    inCollectionsBrowser: boolean;
    atLeastSingleCollectionExists: boolean;
    setBusy: (boolean) => void;

    collection: Collection;
    loading: boolean;
};

export const CollectionInformationDrawer = (props: CollectionInformationDrawerProps) => {
    const {
        classes, collection, loading, atLeastSingleCollectionExists, setHasCollectionMetadataUpdates,
        inCollectionsBrowser, path
    } = props;

    const paths = pathHierarchy(path);

    if (!collection) {
        return atLeastSingleCollectionExists && inCollectionsBrowser
            && <EmptyInformationDrawer message="Select a collection to display its metadata" />;
    }

    const isMetaDataEditable = collection && collection.canWrite && paths.length === 0;
    const relativePath = fullPath => fullPath.split('/').slice(2).join('/');

    return (
        <>
            <CollectionDetails
                collection={collection}
                inCollectionsBrowser={props.inCollectionsBrowser}
                loading={loading}
                setBusy={props.setBusy}
            />
            <ExpansionPanel defaultExpanded>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Metadata for {collection.name}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <LinkedDataEntityFormWithLinkedData
                        subject={collection.iri}
                        isMetaDataEditable={isMetaDataEditable}
                        setHasCollectionMetadataUpdates={setHasCollectionMetadataUpdates}
                    />
                </ExpansionPanelDetails>
            </ExpansionPanel>
            {
                paths.map(metadataPath => (
                    <ExpansionPanel
                        key={metadataPath}
                        defaultExpanded
                    >
                        <ExpansionPanelSummary
                            expandIcon={<ExpandMoreIcon />}
                        >
                            <Typography
                                className={classes.heading}
                            >
                                Metadata for {relativePath(metadataPath)}
                            </Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <PathMetadata
                                path={metadataPath}
                                isMetaDataEditable={collection.canManage && metadataPath === paths[paths.length - 1]}
                                style={{width: '100%'}}
                            />
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                ))
            }
        </>
    );
};

CollectionInformationDrawer.defaultProps = {
    inCollectionsBrowser: false,
    setBusy: () => {
    }
};

const ContextualCollectionInformationDrawer = ({selectedCollectionIri, ...props}) => {
    const {loading, collections} = useContext(CollectionsContext);
    const collection = collections.find(c => c.iri === selectedCollectionIri);
    const atLeastSingleCollectionExists = collections.length > 0;

    return (
        <CollectionInformationDrawer
            {...props}
            loading={loading}
            collection={collection}
            atLeastSingleCollectionExists={atLeastSingleCollectionExists}
        />
    );
};

export default withRouter(withStyles(styles)(ContextualCollectionInformationDrawer));
