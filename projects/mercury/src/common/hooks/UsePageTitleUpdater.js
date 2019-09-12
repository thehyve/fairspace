import {useContext, useEffect} from 'react';
import {VersionContext} from '@fairspace/shared-frontend';

import useNamespacedIri from './UseNamespacedIri';
import useSubject from './UseSubject';

const separator = '-';

const UsePageTitleUpdater = (segments) => {
    const subject = useSubject();
    const iri = useNamespacedIri(subject);
    const {description: workspaceDescription} = useContext(VersionContext);

    useEffect(() => {
        const labels = segments ? segments.map(({label}) => label).join('/') : '';
        const iriToShow = iri ? `${iri} ${separator} ` : '';

        document.title = `${iriToShow}${labels} ${separator} ${workspaceDescription}`;
    }, [iri, workspaceDescription, segments]);
};

export default UsePageTitleUpdater;
