import {connect} from "react-redux";
import {fetchMetadataVocabularyIfNeeded} from "../../actions/vocabularyActions";
import {getVocabulary, isVocabularyPending} from "../../reducers/cache/vocabularyReducers";
import NewEntityDialog from "./common/NewEntityDialog";

const mapStateToProps = state => ({
    loading: isVocabularyPending(state),
    shapes: getVocabulary(state).getFairspaceClasses()
});

const mapDispatchToProps = {
    fetchShapes: fetchMetadataVocabularyIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(NewEntityDialog);
