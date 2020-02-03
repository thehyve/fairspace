import React from 'react';
import {Paper} from "@material-ui/core";
import {BreadCrumbs, usePageTitleUpdater} from "../../common";
import {LinkedDataEntityFormContainer, LinkedDataEntityHeader} from './index';
import useNamespacedIri from "../../common/hooks/UseNamespacedIri";
import useLinkedData from '../UseLinkedData';
import {DATE_DELETED_URI} from "../../constants";

export default ({title, subject}) => {
    const iri = useNamespacedIri(subject);
    usePageTitleUpdater(`${iri} - ${title}`);

    const {properties, values, linkedDataLoading, linkedDataError, typeInfo, updateLinkedData} = useLinkedData(subject);
    const isDeleted = values[DATE_DELETED_URI];

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
                    isDeleted={isDeleted}
                />
                <LinkedDataEntityFormContainer
                    subject={subject}
                    fullpage
                    properties={properties}
                    values={values}
                    linkedDataLoading={linkedDataLoading}
                    linkedDataError={linkedDataError}
                    updateLinkedData={updateLinkedData}
                    isDeleted={isDeleted}
                />
            </Paper>
        </>
    );
};
