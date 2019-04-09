import {connect} from "react-redux";
import {getMetaVocabulary, isMetaVocabularyPending} from "../../../reducers/cache/vocabularyReducers";
import {fetchMetaVocabularyIfNeeded} from "../../../actions/vocabularyActions";
import NewEntityDialog from "../common/NewEntityDialog";

const mapStateToProps = state => ({
    loading: isMetaVocabularyPending(state),
    shapes: getMetaVocabulary(state).getFairspaceClasses()
});

const mapDispatchToProps = {
    fetchShapes: fetchMetaVocabularyIfNeeded
};

export default connect(mapStateToProps, mapDispatchToProps)(NewEntityDialog);
