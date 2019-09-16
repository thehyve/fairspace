import React from 'react';
import {Paper} from "@material-ui/core";
import {BreadCrumbs, usePageTitleUpdater} from "@fairspace/shared-frontend";
import {LinkedDataEntityFormContainer, LinkedDataEntityHeader} from '.';
import useNamespacedIri from "../../common/hooks/UseNamespacedIri";

export default ({title, subject}) => {
    const iri = useNamespacedIri(subject)
    usePageTitleUpdater(`${iri} - ${title}`);

    return (
        <>
            <BreadCrumbs />
            <Paper style={{maxWidth: 800, padding: 20}}>
                <LinkedDataEntityHeader subject={subject} />
                <LinkedDataEntityFormContainer subject={subject} fullpage />
            </Paper>
        </>
    );
};
