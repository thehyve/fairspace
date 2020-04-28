import React from 'react';
import {Paper} from "@material-ui/core";
import {BreadCrumbs, usePageTitleUpdater} from "../../common";
import useNamespacedIri from "../../common/hooks/UseNamespacedIri";
import useLinkedData from './UseLinkedData';
import LinkedDataEntityFormContainer from "./LinkedDataEntityFormContainer";
import LinkedDataEntityHeader from "./LinkedDataEntityHeader";

export default ({title, subject}) => {
    const iri = useNamespacedIri(subject);
    usePageTitleUpdater(`${iri} - ${title}`);

    const {properties, values, linkedDataLoading, linkedDataError, typeInfo, updateLinkedData} = useLinkedData(subject);

    return (
        <>
            <BreadCrumbs />
            <Paper style={{maxWidth: 800, padding: 20}}>
                <LinkedDataEntityHeader
                    subject={subject}
                    typeInfo={typeInfo}
                    values={values}
                    linkedDataLoading={linkedDataLoading}
                    linkedDataError={linkedDataError}
                    updateLinkedData={updateLinkedData}
                />
                <LinkedDataEntityFormContainer
                    subject={subject}
                    fullpage
                    properties={properties}
                    values={values}
                    linkedDataLoading={linkedDataLoading}
                    linkedDataError={linkedDataError}
                    updateLinkedData={updateLinkedData}
                />
            </Paper>
        </>
    );
};
