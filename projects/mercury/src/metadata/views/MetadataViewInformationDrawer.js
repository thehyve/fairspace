// @flow
import React from 'react';
import {Card, CardContent, CardHeader, IconButton} from '@mui/material';
import {withRouter} from 'react-router-dom';

import {Close} from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import EmptyInformationDrawer from '../../common/components/EmptyInformationDrawer';
import {LinkedDataEntityFormWithLinkedData} from '../common/LinkedDataEntityFormContainer';
import type {MetadataViewEntityWithLinkedFiles} from './metadataViewUtils';
import CopyButton from '../../common/components/CopyButton';

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
    emptyLinkedFiles: {
        fontStyle: 'italic'
    }
}));

type MetadataViewInformationDrawerProps = {
    entity: MetadataViewEntityWithLinkedFiles,
    viewIcon: any,
    handleCloseCard: () => {},
    textFilterLink: string
};

const MetadataViewInformationDrawer = (props: MetadataViewInformationDrawerProps) => {
    const {entity, viewIcon, textFilterLink, handleCloseCard} = props;
    const classes = useStyles();

    if (!entity) {
        return <EmptyInformationDrawer message="Select a row to display its metadata" />;
    }

    return (
        <Card className={classes.card}>
            <CardHeader
                titleTypographyProps={{variant: 'h6'}}
                title={
                    <div>
                        Metadata for {entity.label}
                        <CopyButton style={{marginLeft: 10}} value={textFilterLink} labelPreCopy="Copy the link" />
                    </div>
                }
                avatar={viewIcon}
                style={{wordBreak: 'break-word'}}
                action={
                    <IconButton title="Close" onClick={handleCloseCard} size="medium">
                        <Close />
                    </IconButton>
                }
            />
            <CardContent>
                <LinkedDataEntityFormWithLinkedData subject={entity.iri} hasEditRight={false} />
            </CardContent>
        </Card>
    );
};

export default withRouter(MetadataViewInformationDrawer);
