import React from 'react';
import {Grid, Typography, Chip, Tooltip, Divider} from "@material-ui/core";

import useLinkedData from '../UseLinkedData';
import Iri from "../../common/Iri";
import IriTooltip from "../../common/IriTooltip";

const LinkedDataEntityHeader = ({subject}) => {
    const {linkedDataError, label, description} = useLinkedData(subject);

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
                    <Tooltip
                        title={(
                            <Typography
                                variant="caption"
                                color="inherit"
                                style={{whiteSpace: 'pre-line'}}
                            >
                                {description}
                            </Typography>
                        )}
                        aria-label={description}
                    >
                        <Chip label={label || '........'} />
                    </Tooltip>
                </Grid>
            </Grid>
            <Divider style={{marginTop: 16}} />
        </>
    );
};

export default LinkedDataEntityHeader;
