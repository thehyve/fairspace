// @flow
import React, {useState} from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Collapse,
    FormControl,
    FormGroup,
    FormLabel,
    IconButton,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import {withRouter} from 'react-router-dom';

import {ExpandMore, FolderOpenOutlined, InsertDriveFileOutlined} from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import EmptyInformationDrawer from '../common/components/EmptyInformationDrawer';
import {getPathHierarchy} from '../file/fileUtils';
import type {ExternalStorage} from './externalStorageUtils';
import {getPathToDisplay} from './externalStorageUtils';
import MessageDisplay from '../common/components/MessageDisplay';
import FileAPI from '../file/FileAPI';
import LinkedDataLink from '../metadata/common/LinkedDataLink';
import type {DisplayProperty} from './UseExternalStorageMetadata';
import useExternalStorageMetadata from './UseExternalStorageMetadata';

const useStyles = makeStyles(theme => ({
    expandOpen: {
        transform: 'rotate(180deg)'
    },
    card: {
        marginTop: 10,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        outline: 'none',
        transitionBorder: '.24s',
        easeInOut: true,
        '& .MuiCardHeader-root .MuiSvgIcon-root': {
            color: theme.palette.primary.contrastText
        }
    }
}));

type ExternalMetadataCardProperties = {
    title: string,
    forceExpand: boolean,
    path: string,
    storage: ExternalStorage
};

const ExternalMetadataCard = (props: ExternalMetadataCardProperties) => {
    const {title, forceExpand, path, storage} = props;
    const classes = useStyles();

    const fileAPI = new FileAPI(storage.path);
    const {
        metadata = {},
        loading,
        error,
        linkedMetadataEntities = {},
        linkedMetadataEntitiesLoading
    } = useExternalStorageMetadata(path, fileAPI);

    const isDirectory = metadata.iscollection && metadata.iscollection.toLowerCase() === 'true';
    const avatar = isDirectory ? <FolderOpenOutlined /> : <InsertDriveFileOutlined />;

    const [expandedManually, setExpandedManually] = useState(null); // true | false | null
    const expanded = expandedManually != null ? expandedManually : forceExpand;
    const toggleExpand = () => setExpandedManually(!expanded === forceExpand ? null : !expanded);

    const renderProperty = (data: Map<string, DisplayProperty>, key: string) =>
        data[key] &&
        data[key].value != null &&
        data[key].value !== '' && (
            <ListItem disableGutters key={key}>
                <FormControl>
                    <FormLabel>{data[key].label || key}</FormLabel>
                    <FormGroup>
                        <ListItemText primary={data[key].value} style={{whiteSpace: 'pre-line'}} />
                    </FormGroup>
                </FormControl>
            </ListItem>
        );

    const renderLinkProperties = (data: Map<string, DisplayProperty>, key: string) =>
        data[key] &&
        data[key].length > 0 && (
            <ListItem disableGutters key={key}>
                <FormControl>
                    <FormLabel>{key}</FormLabel>
                    <FormGroup>
                        {data[key].map(value => (
                            <LinkedDataLink uri={value.id} key={value.id}>
                                <ListItemText primary={value.label} />
                            </LinkedDataLink>
                        ))}
                    </FormGroup>
                </FormControl>
            </ListItem>
        );

    const renderCardContent = () => {
        if (error) {
            return <MessageDisplay message="An error occurred while fetching metadata." />;
        }
        if (loading) {
            return <div>Loading...</div>;
        }
        if (!metadata || Object.keys(metadata).length === 0) {
            return <div>No metadata found</div>;
        }
        return (
            <List>
                {Object.keys(metadata).map(k => renderProperty(metadata, k))}
                {linkedMetadataEntitiesLoading ? (
                    <div>Loading linked metadata entities...</div>
                ) : (
                    Object.keys(linkedMetadataEntities).map(k => renderLinkProperties(linkedMetadataEntities, k))
                )}
            </List>
        );
    };

    return (
        <Card className={classes.card}>
            <CardHeader
                titleTypographyProps={{variant: 'h6'}}
                title={title}
                avatar={avatar}
                style={{wordBreak: 'break-word'}}
                action={
                    <IconButton
                        onClick={toggleExpand}
                        aria-expanded={expanded}
                        aria-label="Show more"
                        className={expanded ? classes.expandOpen : ''}
                        size="medium"
                    >
                        <ExpandMore />
                    </IconButton>
                }
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent style={{paddingTop: 0}}>{renderCardContent()}</CardContent>
            </Collapse>
        </Card>
    );
};

type ExternalStorageInformationDrawerProperties = {
    atLeastSingleRootFileExists: boolean,
    path: string,
    selected: string,
    storage: ExternalStorage
};

export const ExternalStorageInformationDrawer = (props: ExternalStorageInformationDrawerProperties) => {
    const {atLeastSingleRootFileExists, path, selected, storage} = props;

    const paths = getPathHierarchy(path, false);
    if (selected) {
        paths.push(selected);
    }

    if (paths.length === 0 && !selected) {
        return atLeastSingleRootFileExists ? (
            <EmptyInformationDrawer message="Select a file or a folder to display its metadata" />
        ) : (
            <></>
        );
    }

    return paths.map((p, index) => (
        <ExternalMetadataCard
            key={p}
            title={`Metadata for ${getPathToDisplay(p)}`}
            forceExpand={index === paths.length - 1}
            path={p}
            storage={storage}
        />
    ));
};

export default withRouter(ExternalStorageInformationDrawer);
