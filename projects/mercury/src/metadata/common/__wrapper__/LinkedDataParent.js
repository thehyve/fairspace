import React, { useEffect } from 'react';
import { MemoryRouter, useHistory } from 'react-router-dom';
import { useLinkedDataNoContext } from '../UseLinkedData';

const WrapperWithPushToHistory = ({ children }) => {
    const history = useHistory();

    useEffect(() => history.push(), [history]);

    return children;
};

const LinkedDataParent = (props) => {
    const { iri, context } = props;
    context.result = useLinkedDataNoContext(iri, context);

    return (
        <MemoryRouter>
            <WrapperWithPushToHistory />
        </MemoryRouter>
    );
};

export { LinkedDataParent };
