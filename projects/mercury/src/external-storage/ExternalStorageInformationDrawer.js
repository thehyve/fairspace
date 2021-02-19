// @flow
import React, {useState} from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Collapse,
    FormControl, FormGroup, FormLabel,
    IconButton,
    List,
    ListItem,
    ListItemText,
} from '@material-ui/core';
import {withRouter} from 'react-router-dom';

import {ExpandMore, FolderOpenOutlined, InsertDriveFileOutlined} from '@material-ui/icons';
import {makeStyles} from '@material-ui/core/styles';
import EmptyInformationDrawer from "../common/components/EmptyInformationDrawer";
import {getPathHierarchy} from "../file/fileUtils";
import {getPathToDisplay} from "./externalStorageUtils";
import useAsync from "../common/hooks/UseAsync";
import MessageDisplay from "../common/components/MessageDisplay";
import {formatDate} from "../common/utils/genericUtils";
import {getDisplayName} from "../users/userUtils";
import type {User} from "../users/UsersAPI";
import type {ExternalStorage} from "./externalStorageUtils";
import FileAPI from "../file/FileAPI";


const useStyles = makeStyles(() => ({
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    card: {
        marginTop: 10,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        outline: "none",
        transitionBorder: ".24s",
        easeInOut: true
    }
}));

type DisplayProperty = {
    label: string;
    value: any;
}

const ignoredProperties = [
    'filename', 'basename', 'displayname', 'name', 'type', 'iri', 'ownedBy', 'ownedByName',
    'access', 'canRead', 'canWrite', 'canManage', 'canDelete', 'canUndelete', 'accessMode', 'isreadonly',
    'userPermissions', 'availableStatuses', 'workspacePermissions', 'availableAccessModes',
    'status', 'getcreated', 'getcontenttype', 'etag', 'getetag', 'iscollection',
    'supported-report-set', 'resourcetype', 'getlastmodified', 'getcontentlength', 'size'
];

const mapFileProperties = (data: any = {}, users: User[] = []): Map<string, DisplayProperty> => {
    const defaultProperties = {
        comment: {
            label: "Description",
            value: data.comment
        },
        lastmod: {
            label: "Last modification date",
            value: formatDate(data.lastmod)
        },
        createdBy: {
            label: "Created by",
            value: getDisplayName(users.find(u => u.iri === data.createdBy))
        },
        creationdate: {
            label: "Creation date",
            value: formatDate(data.creationdate)
        }
    };
    const propertiesToDisplay = Object.keys(data).filter(
        k => !ignoredProperties.includes(k) && !Object.keys(defaultProperties).includes(k)
    );
    const otherProperties = {};
    propertiesToDisplay.forEach(p => {otherProperties[p] = {value: data[p]};});

    return {...defaultProperties, ...otherProperties};
};

const renderProperty = (data: Map<string, DisplayProperty>, key: string) => (
    data[key] && data[key].value != null && data[key].value !== "" && (
        <ListItem disableGutters key={key}>
            <FormControl>
                <FormLabel>{data[key].label || key}</FormLabel>
                <FormGroup>
                    <ListItemText primary={data[key].value} />
                </FormGroup>
            </FormControl>
        </ListItem>
    )
);

type ExternalMetadataCardProperties = {
    title: string;
    forceExpand: boolean;
    path: string;
    storage: ExternalStorage;
    users: User[];
}

const ExternalMetadataCard = (props: ExternalMetadataCardProperties) => {
    const {title, forceExpand, path, storage, users} = props;
    const fileAPI = new FileAPI(storage.url);
    const {data = {}, error, loading} = useAsync(() => fileAPI.stat(path), [path]);
    const {iscollection} = data;
    const filePropertiesToDisplay = mapFileProperties(data, users);

    const [expandedManually, setExpandedManually] = useState(null); // true | false | null
    const expanded = (expandedManually != null) ? expandedManually : forceExpand;
    const toggleExpand = () => setExpandedManually(!expanded === forceExpand ? null : !expanded);
    const classes = useStyles();
    const isDirectory = iscollection && (iscollection.toLowerCase() === 'true');
    const avatar = isDirectory ? <FolderOpenOutlined /> : <InsertDriveFileOutlined />;

    let body;
    if (error) {
        body = <MessageDisplay message="An error occurred while fetching metadata." />;
    } else if (loading) {
        body = <div>Loading...</div>;
    } else if (!data) {
        body = <div>No metadata found</div>;
    } else {
        body = (
            <List>
                {Object.keys(filePropertiesToDisplay).map(k => (
                    renderProperty(filePropertiesToDisplay, k)
                ))}
            </List>
        );
    }

    return (
        <Card className={classes.card}>
            <CardHeader
                titleTypographyProps={{variant: 'h6'}}
                title={title}
                avatar={avatar}
                style={{wordBreak: 'break-word'}}
                action={(
                    <IconButton
                        onClick={toggleExpand}
                        aria-expanded={expanded}
                        aria-label="Show more"
                        className={expanded ? classes.expandOpen : ''}
                    >
                        <ExpandMore />
                    </IconButton>
                )}
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent style={{paddingTop: 0}}>
                    {body}
                </CardContent>
            </Collapse>
        </Card>
    );
};

type ExternalStorageInformationDrawerProperties = {
    atLeastSingleRootFileExists: boolean,
    path: string,
    selected: string,
    storage: ExternalStorage,
    users: User[]
}

export const ExternalStorageInformationDrawer = (props: ExternalStorageInformationDrawerProperties) => {
    const {atLeastSingleRootFileExists, path, selected, storage, users} = props;

    const paths = getPathHierarchy(path, false);
    if (selected) {
        paths.push(selected);
    }

    if (paths.length === 0 && !selected) {
        return atLeastSingleRootFileExists ? (
            <EmptyInformationDrawer message="Select a file or a folder to display its metadata" />
        ) : <></>;
    }

    return (
        paths.map((p, index) => (
            <ExternalMetadataCard
                key={p}
                title={`Metadata for ${getPathToDisplay(p)}`}
                forceExpand={index === paths.length - 1}
                path={p}
                storage={storage}
                users={users}
            />
        ))
    );
};

export default withRouter(ExternalStorageInformationDrawer);
