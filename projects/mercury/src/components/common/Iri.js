import {connect} from "react-redux";
import {getNamespacedIri} from "../../utils/linkeddata/metadataUtils";
import {getVocabulary} from "../../reducers/cache/vocabularyReducers";

const Iri = ({iri, namespaces}) => getNamespacedIri(iri, namespaces)

const mapStateToProps = state => ({
    namespaces: getVocabulary(state).getNamespaces()
});

export default connect(mapStateToProps)(Iri);
