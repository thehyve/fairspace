package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.rdf.model.Model;

public abstract class VocabularyAwareValidator implements MetadataRequestValidator {
    protected final Model vocabulary;

    protected VocabularyAwareValidator(Model vocabulary) {
        this.vocabulary = vocabulary;
    }
}
