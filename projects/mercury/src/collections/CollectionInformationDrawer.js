// @flow
import React, {useContext, useState} from 'react';
import {Card, CardContent, CardHeader, Collapse, DialogContentText, IconButton, Typography} from '@mui/material';
import {withRouter} from 'react-router-dom';

import {CloudUpload, ExpandMore, Folder, FolderOpenOutlined, InsertDriveFileOutlined} from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import {useDropzone} from 'react-dropzone';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Link from '@mui/material/Link';
import table from 'text-table';
import {SnackbarProvider, useSnackbar} from 'notistack';
import {flatMap} from 'lodash';
import CollectionDetails from './CollectionDetails';
import CollectionsContext from './CollectionsContext';
import {LinkedDataEntityFormWithLinkedData} from '../metadata/common/LinkedDataEntityFormContainer';
import type {Collection} from './CollectionAPI';
import EmptyInformationDrawer from '../common/components/EmptyInformationDrawer';
import useAsync from '../common/hooks/UseAsync';
import {LocalFileAPI} from '../file/FileAPI';
import MessageDisplay from '../common/components/MessageDisplay';
import ErrorDialog from '../common/components/ErrorDialog';
import VocabularyContext from '../metadata/vocabulary/VocabularyContext';
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
} from '../constants';
import {determinePropertyShapesForTypes, determineShapeForTypes} from '../metadata/common/vocabularyUtils';
import {getFirstPredicateId, getFirstPredicateValue} from '../metadata/common/jsonLdUtils';
import {getPathHierarchy} from '../file/fileUtils';

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
    },
    activeStyle: {
        borderColor: theme.palette.info.main,
        borderWidth: 2,
        borderRadius: 2,
        borderStyle: 'dashed',
        opacity: 0.4
    },
    acceptStyle: {
        borderColor: theme.palette.success.main
    },
    rejectStyle: {
        borderColor: theme.palette.error.main
    }
}));

const generateTemplate = vocabulary => {
    const userProps = flatMap(
        [FILE_URI, DIRECTORY_URI, COLLECTION_URI].map(uri => determinePropertyShapesForTypes(vocabulary, [uri]))
    ).filter(ps => !getFirstPredicateValue(ps, MACHINE_ONLY_URI));

    const uniqueProps = [...new Set(userProps.map(ps => getFirstPredicateId(ps, SHACL_PATH))).values()].map(iri =>
        userProps.find(ps => getFirstPredicateId(ps, SHACL_PATH) === iri)
    );

    const typename = ps => {
        const datatype = getFirstPredicateId(ps, SHACL_DATATYPE);
        if (datatype) {
            return datatype.substring(datatype.lastIndexOf('#') + 1);
        }
        const type = getFirstPredicateId(ps, SHACL_CLASS);
        const classShape = determineShapeForTypes(vocabulary, [type]);
        return getFirstPredicateValue(classShape, SHACL_NAME);
    };

    const type = ps => {
        let shaclType = getFirstPredicateId(ps, SHACL_DATATYPE);
        if (!shaclType) {
            shaclType = getFirstPredicateId(ps, SHACL_CLASS);
        }
        return shaclType.substring(shaclType.lastIndexOf('#') + 1);
    };

    const cardinality = ps =>
        getFirstPredicateValue(ps, SHACL_MIN_COUNT, 0) + '..' + getFirstPredicateValue(ps, SHACL_MAX_COUNT, '*');

    const doc = uniqueProps.map(ps => [
        '# ',
        getFirstPredicateValue(ps, SHACL_NAME),
        getFirstPredicateValue(ps, SHACL_DESCRIPTION, ''),
        typename(ps),
        cardinality(ps),
        getFirstPredicateId(ps, SHACL_PATH)
    ]);

    const entityNames = uniqueProps
        .filter(ps => !getFirstPredicateId(ps, SHACL_DATATYPE))
        .map(ps => JSON.stringify(getFirstPredicateValue(ps, SHACL_NAME)).replaceAll('"', "'"));
    const sampleEntityNames =
        entityNames.length > 2 ? entityNames.slice(0, 2).join(' and ') : entityNames.join(' and ');
    const sampleRow = suffix =>
        uniqueProps.map(prop => (type(prop) === 'string' ? '"Sample text value"' : `${type(prop)}${suffix}`));

    return (
        '#   This section describes the CSV-based format used for bulk metadata uploads.\n' +
        `#   Entities (e.g. ${sampleEntityNames}) can be referenced by ID or unique label; multiple values must be separated by the pipe symbol |.\n` +
        '#\n' +
        table([
            ['#', 'COLUMN', 'DESCRIPTION', 'TYPE', 'CARDINALITY', 'PREDICATE'],
            [
                '#',
                'Path',
                'A relative path to a file or a directory; use ./ for the current directory or collection.',
                'string',
                '1..1',
                ''
            ],
            ...doc
        ]) +
        '\n#\n' +
        '"Path",' +
        uniqueProps.map(ps => JSON.stringify(getFirstPredicateValue(ps, SHACL_NAME))).join(',') +
        '\n' +
        '# PUT YOUR DATA BELOW FOLLOWING SAMPLE ROWS. REMOVE THIS LINE AND THE SAMPLE ROWS AFTERWARDS.\n' +
        '# ./,' +
        sampleRow('_0').join(',') +
        '\n' +
        '# ./file1,' +
        sampleRow('_1').join(',') +
        '\n' +
        '# ./file2,' +
        sampleRow('_2').join(',') +
        '\n'
    );
};

const MetadataCard = props => {
    const {title, avatar, children, forceExpand, metadataUploadPath} = props;
    const [expandedManually, setExpandedManually] = useState(null); // true | false | null
    const expanded = expandedManually != null ? expandedManually : forceExpand;
    const toggleExpand = () => setExpandedManually(!expanded === forceExpand ? null : !expanded);
    const classes = useStyles();
    const {vocabulary} = useContext(VocabularyContext);
    const fileTemplate = vocabulary && metadataUploadPath && generateTemplate(vocabulary);
    const [uploadingMetadata, setUploadingMetadata] = useState(false);
    const {enqueueSnackbar} = useSnackbar();

    const uploadMetadata = file => {
        setUploadingMetadata(true);
        LocalFileAPI.uploadMetadata(metadataUploadPath, file)
            .then(() => enqueueSnackbar('Metadata have been successfully uploaded'))
            .catch(e => {
                const errorContents = (
                    <DialogContentText>
                        <Typography style={{fontFamily: 'Monospace', fontSize: 16}} component="pre">
                            {e.message}
                        </Typography>
                    </DialogContentText>
                );
                ErrorDialog.showError('Error uploading metadata', errorContents);
            })
            .finally(() => setUploadingMetadata(false));
    };

    const {getRootProps, getInputProps, open, isDragActive, isDragAccept, isDragReject} = useDropzone({
        noClick: true,
        noKeyboard: true,
        accept: {
            'text/csv': ['.csv']
        },
        onDropAccepted: files => {
            if (files.length === 1) {
                uploadMetadata(files[0]);
            } else {
                ErrorDialog.showError('Please upload metadata files one by one');
            }
        }
    });

    const rootProps = metadataUploadPath && getRootProps();
    const inputProps = metadataUploadPath && getInputProps();
    const dropzoneClassName = () =>
        `${classes.card} ${isDragActive && classes.activeStyle} ${isDragReject && classes.rejectStyle} ${isDragAccept && classes.acceptStyle}`;

    return (
        <Card {...rootProps} className={dropzoneClassName()}>
            {inputProps && <input {...inputProps} />}
            <CardHeader
                titleTypographyProps={{variant: 'h6'}}
                title={title}
                subheader={
                    metadataUploadPath &&
                    "Drag 'n' drop a metadata file here or click the edit button below to see all available fields."
                }
                avatar={avatar}
                style={{wordBreak: 'break-word'}}
                action={
                    <>
                        {metadataUploadPath &&
                            (uploadingMetadata ? (
                                <CircularProgress size={10} />
                            ) : (
                                <Tooltip
                                    interactive="true"
                                    title={
                                        <>
                                            <div>Upload metadata in CSV format.</div>
                                            <div>
                                                {'Download '}
                                                <Link
                                                    download="metadata.csv"
                                                    href={
                                                        'data:text/csv;charset=utf-8,' +
                                                        encodeURIComponent(fileTemplate)
                                                    }
                                                >
                                                    template file
                                                </Link>
                                            </div>
                                        </>
                                    }
                                >
                                    <IconButton onClick={open} size="medium">
                                        <CloudUpload />
                                    </IconButton>
                                </Tooltip>
                            ))}
                        <IconButton
                            onClick={toggleExpand}
                            aria-expanded={expanded}
                            aria-label="Show more"
                            className={expanded ? classes.expandOpen : ''}
                            size="medium"
                        >
                            <ExpandMore />
                        </IconButton>
                    </>
                }
            />
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent style={{paddingTop: 8, paddingBottom: 16}}>{children}</CardContent>
            </Collapse>
        </Card>
    );
};

const PathMetadata = React.forwardRef(({path, showDeleted, hasEditRight = false, forceExpand}, ref) => {
    const {data, error, loading} = useAsync(() => LocalFileAPI.stat(path, showDeleted), [path]);

    let body;
    let isDirectory;
    let avatar = <FolderOpenOutlined />;
    if (error) {
        body = <MessageDisplay message="An error occurred while determining metadata subject" />;
    } else if (loading) {
        body = <div>Loading...</div>;
    } else if (!data || !data.iri) {
        body = <div>No metadata found</div>;
    } else {
        const {iri, iscollection} = data;
        isDirectory = iscollection && iscollection.toLowerCase() === 'true';
        body = <LinkedDataEntityFormWithLinkedData subject={iri} hasEditRight={hasEditRight} />;
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
    path: string,
    inCollectionsBrowser: boolean,
    atLeastSingleCollectionExists: boolean,
    setBusy: boolean => void,
    showDeleted: boolean,
    collection: Collection,
    onChangeOwner: () => void,
    loading: boolean
};

export const CollectionInformationDrawer = (props: CollectionInformationDrawerProps) => {
    const {
        collection,
        loading,
        atLeastSingleCollectionExists,
        setHasCollectionMetadataUpdates,
        inCollectionsBrowser,
        path,
        showDeleted
    } = props;

    const paths = getPathHierarchy(path);

    if (!collection) {
        return (
            atLeastSingleCollectionExists &&
            inCollectionsBrowser && <EmptyInformationDrawer message="Select a collection to display its metadata" />
        );
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
                metadataUploadPath={hasEditRight && paths.length === 0 && collection.name}
            >
                <LinkedDataEntityFormWithLinkedData
                    subject={collection.iri}
                    hasEditRight={hasEditRight}
                    setHasCollectionMetadataUpdates={setHasCollectionMetadataUpdates}
                />
            </MetadataCard>
            {paths.map((metadataPath, index) => (
                <PathMetadata
                    key={metadataPath}
                    path={metadataPath}
                    showDeleted={showDeleted}
                    hasEditRight={hasEditRight}
                    forceExpand={index === paths.length - 1}
                />
            ))}
        </>
    );
};

CollectionInformationDrawer.defaultProps = {
    inCollectionsBrowser: false,
    setBusy: () => {}
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
