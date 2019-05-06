import {connect} from "react-redux";
import {PropTypes} from "prop-types";
import {getCombinedMetadataForSubject, isMetadataPending} from "../../../reducers/cache/jsonLdBySubjectReducers";
import {getTypeInfo, linkLabel} from "../../../utils/linkeddata/metadataUtils";
import {isVocabularyPending} from "../../../reducers/cache/vocabularyReducers";
import LinkedDataEntityHeader from "../common/LinkedDataEntityHeader";

const mapStateToProps = (state, ownProps) => {
    const metadata = getCombinedMetadataForSubject(state, ownProps.subject);
    const hasNoMetadata = !metadata || metadata.length === 0;
    if (hasNoMetadata) {
        return {
            error: true
        };
    }

    const loading = isMetadataPending(state, ownProps.subject) || isVocabularyPending(state);
    const header = linkLabel(ownProps.subject);
    const {label, description} = getTypeInfo(metadata);

    return {
        loading,
        header,
        label,
        description
    };
};

const MetadataEntityHeaderContainer = connect(mapStateToProps)(LinkedDataEntityHeader);

MetadataEntityHeaderContainer.propTypes = {
    subject: PropTypes.string.isRequired
};

export default MetadataEntityHeaderContainer;
