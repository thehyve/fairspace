import {useSelector} from "react-redux";
import {getNamespacedIri} from "../utils/linkeddata/metadataUtils";
import {getVocabulary} from "../reducers/cache/vocabularyReducers";

export default (iri) => {
    const namespaces = useSelector(state => getVocabulary(state).getNamespaces());

    return !!iri && getNamespacedIri(iri, namespaces);
};
