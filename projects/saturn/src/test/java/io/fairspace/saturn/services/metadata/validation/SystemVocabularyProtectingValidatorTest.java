package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.vocabulary.RDF;
import org.junit.Test;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.junit.Assert.*;

public class SystemVocabularyProtectingValidatorTest {
    private final SystemVocabularyProtectingValidator validator = new SystemVocabularyProtectingValidator();

    @Test
    public void itShouldNotBePossibleToDeleteStatementsFromTheSystemVocabulary() {
        var result = validator.validate(
                createDefaultModel()
                        .add(createResource(FS.NS + "FileShape"), RDF.type, createResource(FS.NS + "ClassShape")),
                createDefaultModel());

        assertFalse(result.isValid());
        assertEquals("Cannot remove a statement from the system vocabulary: [http://fairspace.io/ontology#FileShape, http://www.w3.org/1999/02/22-rdf-syntax-ns#type, http://fairspace.io/ontology#ClassShape].",
                result.getMessage());
    }

    @Test
    public void itShouldNotBePossibleToAddArbitraryStatementsToTheSystemVocabulary() {
        var result = validator.validate(
                createDefaultModel(),
                createDefaultModel().add(createResource(FS.NS + "FileShape"), createProperty(FS.NS + "custom"), createStringLiteral("blah")));

        assertFalse(result.isValid());
        assertEquals("Cannot add a statement modifying a shape from the system vocabulary: [http://fairspace.io/ontology#FileShape, http://fairspace.io/ontology#custom, \"blah\"].",
                result.getMessage());
    }

}