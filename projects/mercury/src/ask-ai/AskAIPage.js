import React, {useContext} from 'react';

import {Grid} from '@mui/material';
import MetadataViewContext from '../metadata/views/MetadataViewContext';
import UserContext from '../users/UserContext';
import AskAIConversation from './AskAIChat';
import {getSearchQueryFromString} from '../search/searchUtils';
import AskAIHistory from './AskAIHistory';
import usePageTitleUpdater from '../common/hooks/UsePageTitleUpdater';

const AskAIPage = props => {
    const {currentUser, location: {search} = ''} = props;
    const query = getSearchQueryFromString(search);
    const {views} = useContext(MetadataViewContext);
    const canViewMetadata = currentUser && currentUser.canViewPublicMetadata && views && views.length > 0;

    usePageTitleUpdater('Ask AI');

    return (
        <Grid
            container
            justifyContent="center"
            spacing="10"
            style={{paddingTop: 60, paddingBottom: 60, height: '100%'}}
        >
            <Grid item xs={8}>
                {canViewMetadata && <AskAIConversation initialQuery={query} />}
            </Grid>
            <Grid item xs={4}>
                <AskAIHistory />
            </Grid>
        </Grid>
    );
};

const ContextualAskAIPage = props => {
    const {currentUser} = useContext(UserContext);

    return <AskAIPage currentUser={currentUser} {...props} />;
};

export default ContextualAskAIPage;
