package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.shacl.vocabulary.SHACLM;
import org.apache.jena.sparql.vocabulary.FOAF;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static io.fairspace.saturn.rdf.ModelUtils.*;
import static io.fairspace.saturn.vocabulary.Vocabularies.SYSTEM_VOCABULARY;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.eclipse.jetty.util.ProcessorUtils.availableProcessors;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class ShaclValidatorTest {
    private static final Resource resource1 = createResource("http://example.com/123");
    private static final Resource resource2 = createResource("http://example.com/234");
    private static final Resource closedClass = createResource("http://example.com/ClosedClass");
    private static final Resource closedClassShape = createResource("http://example.com/ClosedClassShape");

    private ShaclValidator validator;
    private Model vocabulary;

    @Mock
    private ViolationHandler violationHandler;


    @Before
    public void setUp() {
        vocabulary = SYSTEM_VOCABULARY.union(createDefaultModel()
                .add(closedClassShape, RDF.type, SHACLM.NodeShape)
                .add(closedClassShape, SHACLM.targetClass, closedClass)
                .add(closedClassShape, SHACLM.closed, createTypedLiteral(true)));

        validator = new ShaclValidator(vocabulary);
    }

    @Test
    public void validateNoChanges() {
        validator.validate(EMPTY_MODEL, EMPTY_MODEL, EMPTY_MODEL, EMPTY_MODEL, violationHandler);
        verifyNoInteractions(violationHandler);
    }

    @Test
    public void validateResourceWithNoType() {
        var model = modelOf(resource1, RDFS.label, createTypedLiteral(123));
        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, violationHandler);

        verifyNoInteractions(violationHandler);
    }

    @Test
    public void validateResourceWithInvalidProperties() {
        var model = modelOf(
                resource1, RDF.type, FS.User,
                resource1, RDFS.label, createTypedLiteral(123),
                resource1, RDFS.comment, createTypedLiteral(123));

        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, violationHandler);

        expect(resource1, RDFS.comment, createTypedLiteral(123));

        expect(resource1, RDFS.label, createTypedLiteral(123));

        verifyNoMoreInteractions(violationHandler);
    }

    @Test
    public void validateResourceWithUnknownProperty() {
        var model = modelOf(
                resource1, RDF.type, closedClass,
                resource1, createProperty("http://example.com#unknown"), createTypedLiteral(123));
        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, violationHandler);

        expect(resource1, createProperty("http://example.com#unknown"), createTypedLiteral(123));
        expect(resource1, RDF.type, closedClass);

        verifyNoMoreInteractions(violationHandler);
    }

    @Test
    public void validateResourceMissingRequiredProperty() {
        var model = modelOf(
                resource1, RDF.type, FS.Workspace
        );

        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, violationHandler);

        expect(resource1, RDFS.label, null);

        verifyNoMoreInteractions(violationHandler);
    }

    @Test
    public void validateResourceWithWrongObjectsType() {
        var model = modelOf(
                resource1, RDF.type, FS.File,
                resource1, FS.createdBy, createTypedLiteral(123));
        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, violationHandler);

        expect(resource1, FS.createdBy, createTypedLiteral(123));
    }

    @Test
    public void canPerformTypeChecks() {
        var before = modelOf(resource2, RDF.type, FS.User);

        var toAdd = modelOf(
                resource1, RDF.type, FS.File,
                resource1, FS.createdBy, resource2);

        validator.validate(before, before.union(toAdd), EMPTY_MODEL, toAdd, violationHandler);

        verifyNoInteractions(violationHandler);

        before = modelOf(resource2, RDF.type, FOAF.Person);

        validator.validate(before, before.union(toAdd), EMPTY_MODEL, toAdd, violationHandler);

        expect(resource1, FS.createdBy, resource2);

        verifyNoMoreInteractions(violationHandler);
    }

    @Test
    public void blankNodesAreProperlyValidated() {
        // If the update contains a blank node, it should be validated solely with the
        // information from the update, as there can not be any triple in the database
        // already that references this blank node
        var blankNode = createResource();
        var model = modelOf(blankNode, RDF.type, closedClass,
                blankNode, FS.md5, createStringLiteral("test"));

        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, violationHandler);

        expect(blankNode, FS.md5, createStringLiteral("test"));
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

        validator.validate(before, before.union(toAdd), EMPTY_MODEL, toAdd, violationHandler);

        verifyNoInteractions(violationHandler);
    }

    @Test
    public void validationForSomethingReferringToABlankNode() {
        var blankNode = createResource();
        var before = createDefaultModel()
                .add(blankNode, RDF.type, FS.User)
                .add(resource1, RDF.type, FS.Collection)
                .add(resource1, RDFS.label, "collection")
                .add(resource1, RDFS.comment, "bla")
                .add(resource1, FS.connectionString, "a")
                .add(resource1, FS.createdBy, blankNode);

        //Resource newBlankNode = createResource();
        var toAdd = createDefaultModel()
                .add(resource1, RDFS.label, "new");

        var toRemove = createDefaultModel()
                .add(resource1, RDFS.label, "collection");

        validator.validate(before, before.difference(toRemove).union(toAdd), toRemove, toAdd, violationHandler);

        verifyNoInteractions(violationHandler);
    }

    @Test
    public void validationForSomethingReferringToABlankNode2() {
        var blankNode = createResource();
        var before = createDefaultModel()
                .add(blankNode, RDF.type, FS.User)
                .add(resource1, RDF.type, FS.Collection)
                .add(resource1, RDFS.label, "collection")
                .add(resource1, RDFS.comment, "bla")
                .add(resource1, FS.connectionString, "a")
                .add(resource1, FS.createdBy, blankNode);

        var newBlankNode = createResource();
        var toAdd = modelOf(resource1, FS.createdBy, newBlankNode);

        var toRemove = modelOf(resource1, FS.createdBy, blankNode);

        validator.validate(before, before.difference(toRemove).union(toAdd), toRemove, toAdd, violationHandler);

        expect(resource1, FS.createdBy, newBlankNode);
    }

    @Test
    public void multipleResourcesAreValidatedAsExpected() {
        var model = createDefaultModel();
        for (int i = 0; i < 2 * availableProcessors(); i++) {
            var resource = createResource();
            model.add(resource, RDF.type, FS.File).add(resource, FS.createdBy, createTypedLiteral(123));
        }

        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, violationHandler);

        model.listSubjects().forEachRemaining(resource ->
                expect(resource, FS.createdBy, createTypedLiteral(123)));

        verifyNoMoreInteractions(violationHandler);
    }

    private void expect(Resource subject, Property predicate, RDFNode object) {
        verify(violationHandler).onViolation(anyString(), eq(asNode(subject)), eq(asNode(predicate)), eq(asNode(object)));
    }
}
