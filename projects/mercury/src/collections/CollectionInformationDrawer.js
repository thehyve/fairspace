// @flow
import React, {useContext, useState} from 'react';
import {Card, CardContent, CardHeader, Collapse, IconButton} from '@material-ui/core';
import {withRouter} from 'react-router-dom';

import {CloudUpload, ExpandMore, Folder, FolderOpenOutlined, InsertDriveFileOutlined} from '@material-ui/icons';
import {makeStyles} from '@material-ui/core/styles';
import {useDropzone} from "react-dropzone";
import CircularProgress from "@material-ui/core/CircularProgress";
import Tooltip from "@material-ui/core/Tooltip";
import Link from "@material-ui/core/Link";
import table from "text-table";
import {SnackbarProvider, useSnackbar} from "notistack";
import CollectionDetails from "./CollectionDetails";
import CollectionsContext from "./CollectionsContext";
import {LinkedDataEntityFormWithLinkedData} from '../metadata/common/LinkedDataEntityFormContainer';
import type {Collection} from './CollectionAPI';
import EmptyInformationDrawer from "../common/components/EmptyInformationDrawer";
import useAsync from '../common/hooks/UseAsync';
import FileAPI from '../file/FileAPI';
import MessageDisplay from '../common/components/MessageDisplay';
import ErrorDialog from "../common/components/ErrorDialog";
import VocabularyContext from "../metadata/vocabulary/VocabularyContext";
import {
    COLLECTION_URI,
    DIRECTORY_URI,
    FILE_URI,
    MACHINE_ONLY_URI,
    SHACL_CLASS,
    SHACL_DATATYPE,
    SHACL_DESCRIPTION,
    SHACL_MAX_COUNT,
    SHACL_MIN_COUNT,
    SHACL_NAME,
    SHACL_PATH
} from "../constants";
import {determinePropertyShapesForTypes, determineShapeForTypes} from "../metadata/common/vocabularyUtils";
import {getFirstPredicateId, getFirstPredicateValue} from "../metadata/common/jsonLdUtils";

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

const useStyles = makeStyles(() => ({
    expandOpen: {
        transform: 'rotate(180deg)',
    }
}));

const generateTemplate = (vocabulary) => {
    const userProps = [FILE_URI, DIRECTORY_URI, COLLECTION_URI]
        .flatMap(uri => determinePropertyShapesForTypes(vocabulary, [uri]))
        .filter(ps => !getFirstPredicateValue(ps, MACHINE_ONLY_URI));

    const uniqueProps = [...new Set(userProps.map(ps => getFirstPredicateId(ps, SHACL_PATH)))
        .values()]
        .map(iri => userProps.find(ps => getFirstPredicateId(ps, SHACL_PATH) === iri));

    const typename = ps => {
        const datatype = getFirstPredicateId(ps, SHACL_DATATYPE);
        if (datatype) {
            return datatype.substring(datatype.lastIndexOf('#') + 1);
        }
        const type = getFirstPredicateId(ps, SHACL_CLASS);
        const classShape = determineShapeForTypes(vocabulary, [type]);
        return getFirstPredicateValue(classShape, SHACL_NAME);
    };

    const cardinality = ps => getFirstPredicateValue(ps, SHACL_MIN_COUNT, 0) + '..' + getFirstPredicateValue(ps, SHACL_MAX_COUNT, '*');

    const doc = uniqueProps.map(ps => [
        '# ',
        getFirstPredicateValue(ps, SHACL_NAME),
        getFirstPredicateValue(ps, SHACL_DESCRIPTION),
        typename(ps),
        cardinality(ps),
        getFirstPredicateId(ps, SHACL_PATH)
    ]);

    return '#   This section describes the CSV-based format used for bulk metadata uploads.\n'
        + '#   Entity types can referenced by ID; multiple values must be separated by the pipe symbol |.\n'
        + '#\n'
        + table([
            ['#', 'COLUMN', 'DESCRIPTION', 'TYPE', 'CARDINALITY', 'PREDICATE'],
            ['#', 'Path', 'A relative path to a file or a directory, use ./ for the current directory or collection.', 'string', '1..1', ''],
            ...doc]) + '\n\n'
        + '"Path",' + uniqueProps.map(ps => JSON.stringify(getFirstPredicateValue(ps, SHACL_NAME))).join(',') + '\n'
        + '<PUT YOUR DATA HERE>\n';
};

const MetadataCard = React.forwardRef((props, ref) => {
    const {title, avatar, children, forceExpand, metadataUploadPath} = props;
    const [expandedManually, setExpandedManually] = useState(null); // true | false | null
    const expanded = (expandedManually != null) ? expandedManually : forceExpand;
    const toggleExpand = () => setExpandedManually(!expanded === forceExpand ? null : !expanded);
    const classes = useStyles();
    const {vocabulary} = useContext(VocabularyContext);
    const fileTemplate = vocabulary && metadataUploadPath && generateTemplate(vocabulary);
    const [uploadingMetadata, setUploadingMetadata] = useState(false);
    const {enqueueSnackbar} = useSnackbar();

    const uploadMetadata = (file) => {
        setUploadingMetadata(true);
        FileAPI.uploadMetadata(metadataUploadPath, file)
            .then(() => enqueueSnackbar('Metadata have been successfully uploaded'))
            .catch(e => ErrorDialog.showError('Error uploading metadata', e))
            .finally(() => setUploadingMetadata(false));
    };

    const {getRootProps, getInputProps, open} = useDropzone({
        noClick: true,
        noKeyboard: true,
        accept: ".csv,text/csv"
        onDropAccepted: (files) => {
            if (files.length === 1) {
                uploadMetadata(files[0]);
            } else {
                ErrorDialog.showError("Please upload metadata files one by one");
            }
        }
    });

    const rootProps = metadataUploadPath && getRootProps();
    const inputProps = metadataUploadPath && getInputProps();

    return (
        <Card {...rootProps} style={{marginTop: 10}} ref={ref}>
            {inputProps && (<input {...inputProps} />)}
            <CardHeader
                titleTypographyProps={{variant: 'h6'}}
                title={title}
                subheader={metadataUploadPath && 'Drag \'n\' drop a metadata file here'}
                avatar={avatar}
                style={{wordBreak: 'break-word'}}
                action={(
                    <>
                        {metadataUploadPath && (uploadingMetadata
                            ? <CircularProgress size={10} />
                            : (
                                <Tooltip
                                    interactive
                                    title={(
                                        <>
                                            <div>Upload metadata in CSV format.</div>
                                            <div>
                                                {'Download '}
                                                <Link
                                                    download="metadata.csv"
                                                    href={'data:text/csv;charset=utf-8,' + encodeURIComponent(fileTemplate)}
                                                >template file
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                >
                                    <IconButton onClick={open}><CloudUpload /></IconButton>
                                </Tooltip>
                            ))}
                        <IconButton
                            onClick={toggleExpand}
                            aria-expanded={expanded}
                            aria-label="Show more"
                            className={expanded ? classes.expandOpen : ''}
                        >
                            <ExpandMore />
                        </IconButton>
                    </>
                )}
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    {children}
                </CardContent>
            </Collapse>
        </Card>
    );
});

const PathMetadata = React.forwardRef(({path, showDeleted, hasEditRight = false, forceExpand}, ref) => {
    const {data, error, loading} = useAsync(() => FileAPI.stat(path, showDeleted), [path]);
    // Parse stat data
    const fileProps = data && data.props;
    const subject = fileProps && fileProps.iri;
    const isDirectory = fileProps && fileProps.iscollection && (fileProps.iscollection.toLowerCase() === 'true');
    let body;
    let avatar = <FolderOpenOutlined />;
    if (error) {
        body = <MessageDisplay message="An error occurred while determining metadata subject" />;
    } else if (loading) {
        body = <div>Loading...</div>;
    } else if (!subject || !fileProps) {
        body = <div>No metadata found</div>;
    } else {
        body = (
            <LinkedDataEntityFormWithLinkedData
                subject={fileProps.iri}
                hasEditRight={hasEditRight}
                onUploadMetadata={hasEditRight && (file => FileAPI.uploadMetadata(path, file))}
            />
        );
        if (!isDirectory) {
            avatar = <InsertDriveFileOutlined />;
        }
    }
    const relativePath = fullPath => fullPath.split('/').slice(2).join('/');

    return (
        <MetadataCard
            ref={ref}
            title={`Metadata for ${relativePath(path)}`}
            avatar={avatar}
            forceExpand={forceExpand}
            metadataUploadPath={hasEditRight && forceExpand && isDirectory && path}
        >
            {body}
        </MetadataCard>
    );
});

type CollectionInformationDrawerProps = {
    path: string;
    inCollectionsBrowser: boolean;
    atLeastSingleCollectionExists: boolean;
    setBusy: (boolean) => void;
    showDeleted: boolean;
    collection: Collection;
    onChangeOwner: () => void;
    loading: boolean;
};

export const CollectionInformationDrawer = (props: CollectionInformationDrawerProps) => {
    const {
        collection, loading, atLeastSingleCollectionExists, setHasCollectionMetadataUpdates,
        inCollectionsBrowser, path, showDeleted
    } = props;

    const paths = pathHierarchy(path);

    if (!collection) {
        return atLeastSingleCollectionExists && inCollectionsBrowser
            && <EmptyInformationDrawer message="Select a collection to display its metadata" />;
    }

    const hasEditRight = collection && collection.canWrite;

    return (
        <>
            <CollectionDetails
                collection={collection}
                onChangeOwner={props.onChangeOwner}
                loading={loading}
                setBusy={props.setBusy}
            />
            <MetadataCard
                title={`Metadata for ${collection.name}`}
                avatar={<Folder />}
                forceExpand={paths.length === 0}
                metadataUploadPath={hasEditRight && paths.length === 0 && collection.location}
            >
                <LinkedDataEntityFormWithLinkedData
                    subject={collection.iri}
                    hasEditRight={hasEditRight && paths.length === 0}
                    setHasCollectionMetadataUpdates={setHasCollectionMetadataUpdates}
                />
            </MetadataCard>
            {
                paths.map((metadataPath, index) => (
                    <PathMetadata
                        key={metadataPath}
                        path={metadataPath}
                        showDeleted={showDeleted}
                        hasEditRight={hasEditRight && index === paths.length - 1}
                        forceExpand={index === paths.length - 1}
                    />
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
    const {loading, collections, showDeleted} = useContext(CollectionsContext);
    const collection = collections.find(c => c.iri === selectedCollectionIri);
    const atLeastSingleCollectionExists = collections.length > 0;

    return (
        <SnackbarProvider maxSnack={3}>
            <CollectionInformationDrawer
                {...props}
                loading={loading}
                collection={collection}
                showDeleted={showDeleted}
                atLeastSingleCollectionExists={atLeastSingleCollectionExists}
            />
        </SnackbarProvider>
    );
};

export default withRouter(ContextualCollectionInformationDrawer);
