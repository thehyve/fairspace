import React, {useContext} from 'react';

import {Grid} from '@mui/material';
import MetadataViewContext from '../metadata/views/MetadataViewContext';
import UserContext from '../users/UserContext';
import Conversation from './Conversation';
import {getSearchQueryFromString} from '../search/searchUtils';

const LlmSearchPage = props => {
    const {currentUser, location: {search} = ''} = props;
    const query = getSearchQueryFromString(search);
    const {views} = useContext(MetadataViewContext);
    const canViewMetadata = currentUser && currentUser.canViewPublicMetadata && views && views.length > 0;

    return (
        <Grid container justifyContent="center" spacing="5">
            <Grid item xs={1} />
            <Grid item xs={10}>
                {canViewMetadata && <Conversation initialQuery={query} />}
            </Grid>
            <Grid item xs={1} />
        </Grid>
    );
};

const ContextualLlmSearchPage = props => {
    const {currentUser} = useContext(UserContext);

    return <LlmSearchPage currentUser={currentUser} {...props} />;
};

export default ContextualLlmSearchPage;
