import {useContext} from 'react';
import {getNamespacedIri} from "../utils/linkeddata/metadataUtils";
import VocabularyContext from '../../metadata/VocabularyContext';
import {getNamespaces} from '../utils/linkeddata/vocabularyUtils';

export default (iri) => {
    const {vocabulary} = useContext(VocabularyContext);

    return !!iri && getNamespacedIri(iri, getNamespaces(vocabulary));
};
