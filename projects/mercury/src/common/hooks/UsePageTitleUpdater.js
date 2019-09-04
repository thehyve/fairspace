import {useContext, useEffect} from 'react';

import useNamespacedIri from './UseNamespacedIri';
import VersionContext from '../contexts/VersionContext';
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
