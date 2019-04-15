import {connect} from "react-redux";
import {PropTypes} from "prop-types";
import {getCombinedMetadataForSubject, isMetadataPending} from "../../../reducers/cache/jsonLdBySubjectReducers";
import {getTypeInfo, linkLabel} from "../../../utils/metadataUtils";
import {isVocabularyPending} from "../../../reducers/cache/vocabularyReducers";
import LinkedDataEntityHeader from "../common/LinkedDataEntityHeader";

const mapStateToProps = (state, ownProps) => {
    const metadata = getCombinedMetadataForSubject(state, ownProps.subject);

    const typeInfo = getTypeInfo(metadata);
    const label = linkLabel(ownProps.subject);

    return {
        loading: isMetadataPending(state, ownProps.subject) || isVocabularyPending(state),
        error: isMetadataPending(state, ownProps.subject) || isVocabularyPending(state),

        typeInfo,
        label
    };
};

const MetadataEntityHeaderContainer = connect(mapStateToProps)(LinkedDataEntityHeader);

MetadataEntityHeaderContainer.propTypes = {
    subject: PropTypes.string.isRequired
};

export default MetadataEntityHeaderContainer;
