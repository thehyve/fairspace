package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.sparql.vocabulary.FOAF;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.topbraid.shacl.vocabulary.SH;

import java.util.Arrays;

import static io.fairspace.saturn.util.ModelUtils.EMPTY_MODEL;
import static io.fairspace.saturn.util.ModelUtils.modelOf;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.eclipse.jetty.util.ProcessorUtils.availableProcessors;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class ShaclValidatorTest {
    private static final Resource resource1 = createResource("http://example.com/123");
    private static final Resource resource2 = createResource("http://example.com/234");
    private static final Resource closedClass = createResource("http://example.com/ClosedClass");
    private static final Resource closedClassShape = createResource("http://example.com/ClosedClassShape");

    private Dataset ds = DatasetFactory.create();
    private ShaclValidator validator;
    private Model vocabulary;

    @Mock
    private ViolationHandler violationHandler;


    @Before
    public void setUp() {
        initVocabularies(ds);
        vocabulary = ds.getNamedModel(VOCABULARY_GRAPH_URI.getURI());

        ds.getNamedModel(VOCABULARY_GRAPH_URI.getURI())
                .add(closedClassShape, RDF.type, FS.ClassShape)
                .add(closedClassShape, SH.targetClass, closedClass)
                .add(closedClassShape, createProperty(SH.NS + "closed"), createTypedLiteral(true));

        validator = new ShaclValidator();

        doAnswer(invocation -> {
            System.err.println(Arrays.toString(invocation.getArguments()));
            return null;
        }).when(violationHandler).onViolation(any(), any(), any(), any());
    }

    @Test
    public void validateNoChanges() {
        validator.validate(EMPTY_MODEL, EMPTY_MODEL, EMPTY_MODEL, EMPTY_MODEL, vocabulary, violationHandler);
        verifyZeroInteractions(violationHandler);
    }

    @Test
    public void validateResourceWithNoType() {
        var model = modelOf(resource1, RDFS.label, createTypedLiteral(123));
        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, vocabulary, violationHandler);

        verifyZeroInteractions(violationHandler);
    }

    @Test
    public void validateResourceWithInvalidProperties() {
        var model = modelOf(
                resource1, RDF.type, FS.User,
                resource1, RDFS.label, createTypedLiteral(123),
                resource1, RDFS.comment, createTypedLiteral(123));
        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model,
                vocabulary, violationHandler);

        verify(violationHandler).onViolation("Value does not have datatype http://www.w3.org/2001/XMLSchema#string",
                resource1,
                RDFS.comment,
                createTypedLiteral(123));

        verify(violationHandler).onViolation("Value does not have datatype http://www.w3.org/2001/XMLSchema#string",
                resource1,
                RDFS.label,
                createTypedLiteral(123));

        verifyNoMoreInteractions(violationHandler);
    }

    @Test
    public void validateResourceWithUnknownProperty() {
        var model = modelOf(
                resource1, RDF.type, closedClass,
                resource1, createProperty("http://example.com#unknown"), createTypedLiteral(123));
        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model,
                vocabulary, violationHandler);

        verify(violationHandler).onViolation("Predicate <http://example.com#unknown> is not allowed (closed shape)",
                createStatement(resource1,
                        createProperty("http://example.com#unknown"),
                        createTypedLiteral(123)));
    }

    @Test
    public void validateResourceMissingRequiredProperty() {
        var model = modelOf(resource1, RDF.type, FS.File);
        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model,
                vocabulary, violationHandler);

        verify(violationHandler).onViolation("Less than 1 values",
                resource1,
                FS.filePath,
                null);
    }

    @Test
    public void validateResourceWithWrongObjectsType() {
        var model = modelOf(
                resource1, RDF.type, FS.File,
                resource1, FS.filePath, createTypedLiteral(123));
        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, vocabulary, violationHandler);

        verify(violationHandler).onViolation("Value does not have datatype http://www.w3.org/2001/XMLSchema#string",
                resource1,
                FS.filePath,
                createTypedLiteral(123));
    }

    @Test
    public void canPerformTypeChecks() {
        var before = modelOf(resource2, RDF.type, FS.User);

        var toAdd = modelOf(
                resource1, RDF.type, FS.File,
                resource1, FS.filePath, createStringLiteral("some/path"),
                resource1, FS.createdBy, resource2);

        validator.validate(before, before.union(toAdd), EMPTY_MODEL, toAdd, vocabulary, violationHandler);

        verifyZeroInteractions(violationHandler);

        before = modelOf(resource2, RDF.type, FOAF.Person);

        validator.validate(before, before.union(toAdd), EMPTY_MODEL, toAdd, vocabulary, violationHandler);

        verify(violationHandler).onViolation("Value does not have class http://fairspace.io/ontology#User",
                resource1,
                FS.createdBy,
                resource2);
    }

    @Test
    public void blankNodesAreProperlyValidated() {
        // If the update contains a blank node, it should be validated solely with the
        // information from the update, as there can not be any triple in the database
        // already that references this blank node
        var blankNode = createResource();
        var model = modelOf(blankNode, RDF.type, closedClass,
                blankNode, FS.md5, createStringLiteral("test"));

        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, vocabulary, violationHandler);

        verify(violationHandler).onViolation("Predicate <http://fairspace.io/ontology#md5> is not allowed (closed shape)",
                createStatement(blankNode,
                        FS.md5,
                        createStringLiteral("test")));
    }

    @Test
    public void blankNodesAreNotFetchedFromTheDatabase() {
        // If the update contains a blank node, it should be validated solely with the
        // information from the update, as there can not be any triple in the database
        // already that references this blank node
        var before = modelOf(
                resource2, RDF.type, FS.User,
                createResource(), RDF.type, FS.Collection);

        var blankNode = createResource();
        var toAdd = modelOf(
                blankNode, RDF.type, FS.User,
                blankNode, RDFS.label, createTypedLiteral("My label"));

        validator.validate(before, before.union(toAdd), EMPTY_MODEL, toAdd, vocabulary, violationHandler);

        verifyZeroInteractions(violationHandler);
    }

    @Test
    public void validationForSomethingReferringToABlankNode() {
        var blankNode = createResource();
        var before = createDefaultModel()
                .add(blankNode, RDF.type, FS.User)
                .add(resource1, RDF.type, FS.Collection)
                .add(resource1, RDFS.label, "collection")
                .add(resource1, RDFS.comment, "bla")
                .add(resource1, FS.filePath, "/")
                .add(resource1, FS.connectionString, "a")
                .add(resource1, FS.createdBy, blankNode);

        //Resource newBlankNode = createResource();
        var toAdd = createDefaultModel()
                .add(resource1, RDFS.label, "new");

        var toRemove = createDefaultModel()
                .add(resource1, RDFS.label, "collection");

        validator.validate(before, before.difference(toRemove).union(toAdd), toRemove, toAdd, vocabulary, violationHandler);

        verifyZeroInteractions(violationHandler);
    }

    @Test
    public void validationForSomethingReferringToABlankNode2() {
        var blankNode = createResource();
        var before = createDefaultModel()
                .add(blankNode, RDF.type, FS.User)
                .add(resource1, RDF.type, FS.Collection)
                .add(resource1, RDFS.label, "collection")
                .add(resource1, RDFS.comment, "bla")
                .add(resource1, FS.filePath, "/")
                .add(resource1, FS.connectionString, "a")
                .add(resource1, FS.createdBy, blankNode);

        Resource newBlankNode = createResource();
        var toAdd = modelOf(resource1, FS.createdBy, newBlankNode);

        var toRemove = modelOf(resource1, FS.createdBy, blankNode);

        validator.validate(before, before.difference(toRemove).union(toAdd), toRemove, toAdd, vocabulary, violationHandler);

        verify(violationHandler).onViolation("Value does not have class http://fairspace.io/ontology#User",
                resource1,
                FS.createdBy,
                newBlankNode);
    }

    @Test
    public void multipleResourcesAreValidatedAsExpected() {
        var model = createDefaultModel();
        for (int i = 0; i < 2 * availableProcessors(); i++) {
            var resource = createResource();
            model.add(resource, RDF.type, FS.File).add(resource, FS.filePath, createTypedLiteral(123));
        }

        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, vocabulary, violationHandler);

        model.listSubjects().forEachRemaining(resource ->
                verify(violationHandler).onViolation("Value does not have datatype http://www.w3.org/2001/XMLSchema#string",
                        resource,
                        FS.filePath,
                        createTypedLiteral(123)));

        verifyNoMoreInteractions(violationHandler);
    }
}
