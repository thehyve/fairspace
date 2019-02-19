import React from 'react';
import {
    Card, CardHeader, CardContent,
    IconButton, CardActions, Collapse,
    Typography, Icon, withStyles,
    Menu, MenuItem
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import classnames from 'classnames';

import LoadingInlay from './LoadingInlay';
import CollectionEditor from "./CollectionEditor";
import ConfirmationDialog from './ConfirmationDialog';
import PermissionsContainer from "../permissions/PermissionsContainer";
import {canManage} from '../../utils/permissionUtils';

export const ICONS = {
    LOCAL_STORAGE: 'folder_open',
    AZURE_BLOB_STORAGE: 'cloud_open',
    S3_BUCKET: 'cloud_open',
    GOOGLE_CLOUD_BUCKET: 'cloud_open'
};

const DEFAULT_COLLECTION_TYPE = 'LOCAL_STORAGE';

const styles = theme => ({
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
});

class CollectionDetails extends React.Component {
    state = {
        editing: false,
        anchorEl: null,
        expanded: false,
        deleting: false
    };

    handleExpandClick = () => {
        this.setState(state => ({expanded: !state.expanded}));
    };

    handleEdit = () => {
        if (canManage(this.props.collection)) {
            this.setState({editing: true});
            this.handleMenuClose();
        }
    }

    handleDelete = () => {
        if (canManage(this.props.collection)) {
            this.setState({deleting: true});
            this.handleMenuClose();
        }
    }

    handleCloseDelete = () => {
        this.setState({deleting: false});
    }

    handleMenuClick = event => {
        this.setState({anchorEl: event.currentTarget});
    };

    handleMenuClose = () => {
        this.setState({anchorEl: null});
    };

    handleSave = (name, description) => {
        this.props.onUpdateCollection(name, description);
        this.setState({editing: false});
    }

    render() {
        const {classes, loading, collection} = this.props;
        const {anchorEl, expanded, editing, deleting} = this.state;
        const iconName = collection.type && ICONS[collection.type] ? collection.type : DEFAULT_COLLECTION_TYPE;
        const canManageCollection = canManage(collection);

        if (loading) {
            return <LoadingInlay />;
        }

        return (
            <>
                <Card>
                    <CardHeader
                        action={!canManageCollection ? null : (
                            <>
                                <IconButton
                                    aria-label="More"
                                    aria-owns={anchorEl ? 'long-menu' : undefined}
                                    aria-haspopup="true"
                                    onClick={this.handleMenuClick}
                                >
                                    <MoreVertIcon />
                                </IconButton>
                                <Menu
                                    id="simple-menu"
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={this.handleMenuClose}
                                >
                                    <MenuItem onClick={this.handleEdit}>
                                        Rename
                                    </MenuItem>
                                    <MenuItem onClick={this.handleDelete}>
                                        Delete
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                        titleTypographyProps={{variant: 'h6'}}
                        title={collection.name}
                        avatar={(
                            <Icon>
                                {ICONS[iconName]}
                            </Icon>
                        )}
                    />
                    <CardContent>
                        <Typography component="p">
                            {collection.description}
                        </Typography>
                    </CardContent>
                    <CardActions style={{padding: '0 8px'}} disableActionSpacing>
                        <IconButton
                            className={classnames(classes.expand, {
                                [classes.expandOpen]: expanded,
                            })}
                            onClick={this.handleExpandClick}
                            aria-expanded={expanded}
                            aria-label="Show more"
                            title="Collaborators"
                        >
                            <ExpandMoreIcon />
                        </IconButton>
                    </CardActions>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <CardContent>
                            <PermissionsContainer
                                collectionId={collection.iri}
                                canManage={canManageCollection}
                            />
                        </CardContent>
                    </Collapse>
                </Card>
                {editing ? (
                    <CollectionEditor
                        name={collection.name}
                        description={collection.description}
                        title={`Edit ${collection.name}`}
                        onSave={this.handleSave}
                        onClose={() => this.setState({editing: false})}
                    />
                ) : null}
                {deleting ? (
                    <ConfirmationDialog
                        open
                        title="Confirmation"
                        content={`Delete ${collection.name}`}
                        onAgree={() => this.props.onCollectionDelete(this.props.collection)}
                        onDisagree={this.handleCloseDelete}
                        onClose={this.handleCloseDelete}
                    />
                ) : null}
            </>
        );
    }
}

export default withStyles(styles)(CollectionDetails);
