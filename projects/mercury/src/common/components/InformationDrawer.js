// @flow
import React, {useContext} from 'react';
import {
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    Grid,
    Typography,
    withStyles
} from '@material-ui/core';
import AssignmentOutlined from '@material-ui/icons/AssignmentOutlined';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {withRouter} from 'react-router-dom';

import styles from './InformationDrawer.styles';
import CollectionDetails from "../../collections/CollectionDetails";
import PathMetadata from "../../metadata/metadata/PathMetadata";
import CollectionsContext from "../contexts/CollectionsContext";
import {LinkedDataEntityFormWithLinkedData} from '../../metadata/common/LinkedDataEntityFormContainer';
import type {Collection} from '../../collections/CollectionAPI';
import MessageDisplay from './MessageDisplay';

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

type InformationDrawerProps = {
    classes: any;
    path: string;
    inCollectionsBrowser: boolean;
    atLeastSingleCollectionExists: boolean;
    setBusy: (boolean) => void;

    collection: Collection;
    loading: boolean;
};

export class InformationDrawer extends React.Component<InformationDrawerProps> {
    static defaultProps = {
        inCollectionsBrowser: false,
        setBusy: () => {}
    };

    render() {
        const {classes, collection, loading, atLeastSingleCollectionExists, inCollectionsBrowser, path} = this.props;

        const paths = pathHierarchy(path);

        if (!collection) {
            return atLeastSingleCollectionExists && inCollectionsBrowser
                && (
                    <Grid container direction="column" justify="center" alignItems="center">
                        <Grid item>
                            <AssignmentOutlined color="disabled" style={{fontSize: '4em'}} />
                        </Grid>
                        <Grid item>
                            <MessageDisplay
                                message="Select a collection to display its metadata"
                                variant="h6"
                                withIcon={false}
                                isError={false}
                                messageColor="textSecondary"
                            />
                        </Grid>
                    </Grid>
                );
        }

        const isMetaDataEditable = collection && collection.canWrite && paths.length === 0;
        const relativePath = fullPath => fullPath.split('/').slice(2).join('/');

        return (
            <>
                <CollectionDetails
                    collection={collection}
                    inCollectionsBrowser={this.props.inCollectionsBrowser}
                    loading={loading}
                    setBusy={this.props.setBusy}
                />
                <ExpansionPanel defaultExpanded>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Metadata for {collection.name}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <LinkedDataEntityFormWithLinkedData
                            subject={collection.iri}
                            isMetaDataEditable={isMetaDataEditable}
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
    }
}

const ContextualInformationDrawer = ({selectedCollectionIri, ...props}) => {
    const {loading, collections} = useContext(CollectionsContext);
    const collection = collections.find(c => c.iri === selectedCollectionIri);
    const atLeastSingleCollectionExists = collections.length > 0;

    return (
        <InformationDrawer
            {...props}
            loading={loading}
            collection={collection}
            atLeastSingleCollectionExists={atLeastSingleCollectionExists}
        />
    );
};

export default withRouter(withStyles(styles)(ContextualInformationDrawer));
