import React from 'react';
import {Chip, Divider, Grid, Tooltip, Typography} from "@material-ui/core";

import useLinkedData from '../UseLinkedData';
import Iri from "../../common/Iri";
import IriTooltip from "../../common/IriTooltip";
import CollectionBrowserLink from "./CollectionBrowserLink";
import {FILE_PATH_URI} from "../../../constants";

const LinkedDataEntityHeader = ({subject}) => {
    const {linkedDataError, values, typeInfo} = useLinkedData(subject);

    return !linkedDataError && (
        <>
            <Grid container justify="space-between">
                <Grid item>
                    <Typography variant="h5">
                        <IriTooltip title={subject}>
                            <Iri iri={subject} />
                        </IriTooltip>
                    </Typography>
                </Grid>
                <Grid item>
                    <CollectionBrowserLink
                        type={typeInfo.typeIri}
                        filePath={values[FILE_PATH_URI]}
                    />

                    <Tooltip
                        title={(
                            <Typography
                                variant="caption"
                                color="inherit"
                                style={{whiteSpace: 'pre-line'}}
                            >
                                {typeInfo.description}
                            </Typography>
                        )}
                        aria-label={typeInfo.description}
                    >
                        <Chip label={typeInfo.label || '........'} />
                    </Tooltip>
                </Grid>
            </Grid>
            <Divider style={{marginTop: 16}} />
        </>
    );
};

export default LinkedDataEntityHeader;
