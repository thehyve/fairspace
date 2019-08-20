import {useContext, useEffect} from 'react';

import useNamespacedIri from './UseNamespacedIri';
import VersionContext from '../contexts/VersionContext';
import useSubject from './UseSubject';

const separator = '-';

const UsePageTitleUpdater = (segments) => {
    const subject = useSubject();
    const iri = useNamespacedIri(subject);
    const {name: workspaceName} = useContext(VersionContext);

    useEffect(() => {
        const labels = segments ? segments.map(({label}) => label).join('/') : '';
        const iriToShow = iri ? `${iri} ${separator} ` : '';

        document.title = `${iriToShow}${labels} ${separator} ${workspaceName}`;
    }, [iri, workspaceName, segments]);
};

export default UsePageTitleUpdater;
