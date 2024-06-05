import React, {useContext, useState} from 'react';
import {ExpandMore} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    CardHeader,
    Collapse,
    FormControl,
    FormGroup,
    FormHelperText,
    FormLabel,
    IconButton,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    TextField,
    Typography
} from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import classnames from 'classnames';

import PermissionViewer from './PermissionViewer';
import {camelCaseToWords} from '../common/utils/genericUtils';
import CollectionsContext from '../collections/CollectionsContext';
import ConfirmationDialog from '../common/components/ConfirmationDialog';
import ErrorDialog from '../common/components/ErrorDialog';
import type {AccessLevel, AccessMode} from '../collections/CollectionAPI';
import {accessLevels, accessModes, Collection} from '../collections/CollectionAPI';
import {
    accessLevelForCollection,
    collectionAccessIcon,
    descriptionForAccessMode,
    getPrincipalsWithCollectionAccess
} from '../collections/collectionUtils';
import type {User} from '../users/UsersAPI';
import type {Workspace} from '../workspaces/WorkspacesAPI';

const styles = theme => ({
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest
        })
    },
    expandOpen: {
        transform: 'rotate(180deg)'
    },
    permissionsCard: {
        marginTop: 10,
        '& .MuiCardHeader-root .MuiSvgIcon-root': {
            color: theme.palette.primary.contrastText
        }
    },
    avatar: {
        width: 20,
        height: 20,
        display: 'inline-block',
        verticalAlign: 'middle',
        margin: '0 4px'
    },
    additionalCollaborators: {
        display: 'inline-block',
        lineHeight: '20px',
        verticalAlign: 'middle',
        margin: '0 4px'
    },
    property: {
        marginTop: 0
    },
    group: {
        marginLeft: 0,
        marginBottom: 0
    },
    helperText: {
        marginLeft: 0,
        marginBottom: 0
    },
    accessIcon: {
        verticalAlign: 'middle'
    },
    accessName: {
        marginRight: 10,
        marginLeft: 5
    }
});

type PermissionCardProperties = {
    classes?: any,
    collection: Collection,
    users: User[],
    workspaceUsers: User[],
    workspaces: Workspace[],
    maxCollaboratorIcons?: number,
    setBusy?: boolean => void
};

export const PermissionCard = (props: PermissionCardProperties) => {
    const {classes, collection, users, workspaceUsers, workspaces, maxCollaboratorIcons = 5, setBusy} = props;
    const [expanded, setExpanded] = useState(false);
    const [changingAccessMode, setChangingAccessMode] = useState(false);
    const [selectedAccessMode, setSelectedAccessMode] = useState(collection.accessMode);

    const ownerWorkspaceAccess = collection.workspacePermissions.find(p => p.iri === collection.ownerWorkspace)
        ? collection.workspacePermissions.find(p => p.iri === collection.ownerWorkspace).access
        : 'None';
    const [changingOwnerWorkspaceAccess, setChangingOwnerWorkspaceAccess] = useState(false);
    const [selectedOwnerWorkspaceAccess, setSelectedOwnerWorkspaceAccess] = useState(ownerWorkspaceAccess);
    const {setAccessMode, setPermission} = useContext(CollectionsContext);

    const toggleExpand = () => setExpanded(!expanded);
    const collaboratingUsers = getPrincipalsWithCollectionAccess(users, collection.userPermissions);
    const collaboratingWorkspaces = getPrincipalsWithCollectionAccess(workspaces, collection.workspacePermissions);

    const availableWorkspaceMembersAccessLevels = accessLevels.filter(a => a !== 'List');

    const handleSetAccessMode = event => {
        if (collection.canManage) {
            setSelectedAccessMode(event.target.value);
            setChangingAccessMode(true);
        }
    };

    const handleCancelSetAccessMode = () => {
        setChangingAccessMode(false);
    };

    const handleConfirmSetAccessMode = () => {
        setBusy(true);
        setAccessMode(collection.name, selectedAccessMode)
            .then(handleCancelSetAccessMode)
            .catch(() =>
                ErrorDialog.showError('An error occurred while setting an access mode', () =>
                    handleConfirmSetAccessMode()
                )
            )
            .finally(setBusy(false));
    };

    const handleSetOwnerWorkspaceAccess = event => {
        if (collection.canManage) {
            setSelectedOwnerWorkspaceAccess(event.target.value);
            setChangingOwnerWorkspaceAccess(true);
        }
    };

    const handleCancelSetOwnerWorkspaceAccess = () => {
        setChangingOwnerWorkspaceAccess(false);
    };

    const handleConfirmSetOwnerWorkspaceAccess = () => {
        setBusy(true);
        setPermission(collection.name, collection.ownerWorkspace, selectedOwnerWorkspaceAccess)
            .then(handleCancelSetOwnerWorkspaceAccess)
            .catch(() =>
                ErrorDialog.showError('An error occurred while setting an access level', () =>
                    handleConfirmSetOwnerWorkspaceAccess()
                )
            )
            .finally(setBusy(false));
    };

    const permissionIcons = collaboratingUsers
        .slice(0, maxCollaboratorIcons)
        .map(({iri, name}) => (
            <Avatar key={iri} title={name} src="/public/images/avatar.png" className={classes.avatar} />
        ));

    const cardHeaderAction = (
        <>
            {permissionIcons}
            {collaboratingUsers.length > maxCollaboratorIcons ? (
                <div className={classes.additionalCollaborators}>
                    + {collaboratingUsers.length - maxCollaboratorIcons}
                </div>
            ) : (
                ''
            )}
            <IconButton
                className={classnames(classes.expand, {
                    [classes.expandOpen]: expanded
                })}
                onClick={toggleExpand}
                aria-expanded={expanded}
                aria-label="Show more"
                title="Access"
                size="medium"
            >
                <ExpandMore />
            </IconButton>
        </>
    );

    const confirmationMessageForAccessMode = (accessMode: AccessMode) => {
        switch (accessMode) {
            case 'Restricted':
                return (
                    <span>
                        Are you sure you want to change the view mode of collection <em>{collection.name}</em> to{' '}
                        <b>{camelCaseToWords(accessMode)}</b>?<br />
                        Metadata and data files will only be findable and readable for users that have been granted
                        access to the collection explicitly.
                    </span>
                );
            case 'MetadataPublished':
                return (
                    <span>
                        Are you sure you want to <b>publish the metadata</b> of collection <em>{collection.name}</em>?
                        <br />
                        The metadata will be findable and readable for all users with access to public data.
                    </span>
                );
            case 'DataPublished':
                return (
                    <span>
                        Are you sure you want to <b>publish all data</b> of collection <em>{collection.name}</em>?<br />
                        The data will be findable and readable for all users with access to public data.
                        <br />
                        <strong>
                            Warning: This action cannot be reverted. Once published, the collection cannot be
                            unpublished, moved or deleted.
                        </strong>
                    </span>
                );
            default:
                throw Error(`Unknown access mode: ${accessMode}`);
        }
    };

    const showSingleAccessMode = () => (
        <FormControl>
            <ListItemText primary={camelCaseToWords(collection.accessMode)} style={{whiteSpace: 'normal'}} />
            <FormHelperText className={classes.helperText}>
                {descriptionForAccessMode(collection.accessMode)}
            </FormHelperText>
        </FormControl>
    );
    const showMultipleAccessModes = () => (
        <FormControl>
            <TextField
                value={collection.accessMode}
                onChange={mode => handleSetAccessMode(mode)}
                inputProps={{'aria-label': 'View mode'}}
                helperText={descriptionForAccessMode(collection.accessMode)}
                FormHelperTextProps={{className: classes.helperText}}
                select
                SelectProps={{renderValue: selected => camelCaseToWords(selected)}}
            >
                {/* show available access modes which user can select */}
                {collection.availableAccessModes.map(mode => (
                    <MenuItem key={mode} value={mode}>
                        <ListItemText
                            primary={camelCaseToWords(mode)}
                            secondary={descriptionForAccessMode(mode)}
                            style={{whiteSpace: 'normal'}}
                        />
                    </MenuItem>
                ))}
                {/* show not available modes as disabled menu item, so user knows it exists */}
                {accessModes
                    .filter(mode => collection.availableAccessModes.indexOf(mode) < 0)
                    .map(unavailableMode => (
                        <MenuItem key={unavailableMode} value={unavailableMode} disabled>
                            <ListItemText
                                style={{whiteSpace: 'normal'}}
                                primary={camelCaseToWords(unavailableMode)}
                                secondary={descriptionForAccessMode(unavailableMode)}
                            />
                        </MenuItem>
                    ))}
            </TextField>
        </FormControl>
    );

    const renderAccessModeChangeConfirmation = () => (
        <ConfirmationDialog
            open
            title="Confirmation"
            content={confirmationMessageForAccessMode(selectedAccessMode)}
            dangerous
            agreeButtonText="Confirm"
            onAgree={handleConfirmSetAccessMode}
            onDisagree={handleCancelSetAccessMode}
            onClose={handleCancelSetAccessMode}
        />
    );

    const renderAccessMode = () => (
        <FormControl className={classes.property}>
            <FormLabel>Public access</FormLabel>
            <Box className={classes.group}>
                {collection.canManage && collection.availableAccessModes.length > 1
                    ? showMultipleAccessModes()
                    : showSingleAccessMode()}
            </Box>
        </FormControl>
    );

    const renderOwnerWorkspaceAccessChangeConfirmation = () => (
        <ConfirmationDialog
            open
            title="Confirmation"
            content={`Are you sure you want to change all workspace members access to ${selectedOwnerWorkspaceAccess} for ${collection.name} collection?`}
            dangerous
            agreeButtonText="Confirm"
            onAgree={handleConfirmSetOwnerWorkspaceAccess}
            onDisagree={handleCancelSetOwnerWorkspaceAccess}
            onClose={handleCancelSetOwnerWorkspaceAccess}
        />
    );

    const renderOwnerWorkspaceAccess = () => (
        <FormControl className={classes.property}>
            <FormLabel>Workspace member access</FormLabel>
            <Box className={classes.group}>
                <FormGroup>
                    {collection.canManage ? (
                        <TextField
                            value={ownerWorkspaceAccess}
                            onChange={access => handleSetOwnerWorkspaceAccess(access)}
                            inputProps={{'aria-label': 'Owner workspace access'}}
                            select
                        >
                            {availableWorkspaceMembersAccessLevels.map(access => (
                                <MenuItem key={access} value={access}>
                                    <span className={classes.accessIcon}>{collectionAccessIcon(access)}</span>
                                    <span className={classes.accessName}>{access}</span>
                                </MenuItem>
                            ))}
                        </TextField>
                    ) : (
                        <Typography>{camelCaseToWords(ownerWorkspaceAccess)}</Typography>
                    )}
                </FormGroup>
                <FormHelperText className={classes.helperText}>
                    Default access for members of the owner workspace.
                </FormHelperText>
            </Box>
        </FormControl>
    );

    const accessLevelDescription = (access: AccessLevel): string => {
        switch (access) {
            case 'List':
                return 'You can see which files are available in this collection.';
            case 'Read':
                return 'You can download files from this collection.';
            case 'Write':
                return 'You can upload files and add metadata to this collection.';
            case 'Manage':
                return 'Share the collection with users and workspaces.';
            case 'None':
            default:
                return 'No access';
        }
    };

    const accessLevel = accessLevelForCollection(collection);

    return (
        <Card classes={{root: classes.permissionsCard}}>
            <CardHeader
                action={cardHeaderAction}
                titleTypographyProps={{variant: 'h6'}}
                title={collection.canManage ? 'Manage access' : `${accessLevel} access`}
                avatar={collectionAccessIcon(accessLevel, 'large')}
                subheader={accessLevelDescription(accessLevel)}
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent style={{paddingTop: 8, paddingBottom: 16}}>
                    <div style={{overflowX: 'auto'}}>
                        <List>
                            <ListItem disableGutters>{renderAccessMode()}</ListItem>
                            <ListItem disableGutters>{renderOwnerWorkspaceAccess()}</ListItem>
                        </List>
                        <PermissionViewer
                            collection={collection}
                            collaboratingUsers={collaboratingUsers}
                            collaboratingWorkspaces={collaboratingWorkspaces}
                            workspaceUsers={workspaceUsers}
                        />
                    </div>
                </CardContent>
                {changingAccessMode && renderAccessModeChangeConfirmation()}
                {changingOwnerWorkspaceAccess && renderOwnerWorkspaceAccessChangeConfirmation()}
            </Collapse>
        </Card>
    );
};

export default withStyles(styles)(PermissionCard);
