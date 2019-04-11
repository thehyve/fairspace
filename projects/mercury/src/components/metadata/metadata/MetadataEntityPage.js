import React from 'react';
import {PropTypes} from "prop-types";
import {connect} from "react-redux";
import Paper from "@material-ui/core/Paper";

import BreadCrumbs from "../../common/BreadCrumbs";
import MetadataEntityContainer from './MetadataEntityContainer';
import LinkedDataEntityHeader from "../common/LinkedDataEntityHeader";
import {getTypeInfo, linkLabel, url2iri} from "../../../utils/metadataUtils";
import {getCombinedMetadataForSubject, isMetadataPending} from "../../../reducers/cache/jsonLdBySubjectReducers";
import {isVocabularyPending} from "../../../reducers/cache/vocabularyReducers";

const metadataEntityPage = (props) => (
    <>
        <BreadCrumbs homeUrl="/metadata" />
        <Paper>
            <LinkedDataEntityHeader label={props.label} typeInfo={props.typeInfo} />
            <MetadataEntityContainer style={{paddingLeft: 20}} subject={props.subject} />
        </Paper>
    </>
);

metadataEntityPage.propTypes = {
    subject: PropTypes.string.isRequired,
    label: PropTypes.string,
    typeInfo: PropTypes.string
};

const mapStateToProps = (state) => {
    const subject = url2iri(window.location.href);
    const metadata = getCombinedMetadataForSubject(state, subject);

    const typeInfo = getTypeInfo(metadata);
    const label = linkLabel(subject);

    return {
        loading: isMetadataPending(state, subject) || isVocabularyPending(state),
        error: isMetadataPending(state, subject) || isVocabularyPending(state),

        subject,
        typeInfo,
        label
    };
};

export default connect(mapStateToProps)(metadataEntityPage);
