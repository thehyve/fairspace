import {useContext, useEffect} from 'react';

import useNamespacedIri from './UseNamespacedIri';
import WorkspaceContext from '../WorkspaceContext';
import useSubject from './UseSubject';

const separator = '-';

const UsePageTitleUpdater = (segments) => {
    const subject = useSubject();
    const iri = useNamespacedIri(subject);
    const {name: workspaceName} = useContext(WorkspaceContext);

    useEffect(() => {
        const labels = segments ? segments.map(({label}) => label).join('/') : '';
        const iriToShow = iri ? `${iri} ${separator} ` : '';

        document.title = `${iriToShow}${labels} ${separator} ${workspaceName}`;
    }, [iri, workspaceName, segments]);
};

export default UsePageTitleUpdater;
