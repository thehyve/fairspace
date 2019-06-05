package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.vocabulary.FS;
import io.fairspace.saturn.vocabulary.Vocabularies;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.vocabulary.FOAF;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStringLiteral;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.verifyZeroInteractions;

@RunWith(MockitoJUnitRunner.class)
public class ShaclValidatorTest {
    private static final Model EMPTY = createDefaultModel();
    private static final Resource resource1 = createResource("http://example.com/123");
    private static final Resource resource2 = createResource("http://example.com/234");

    private Dataset ds = DatasetFactory.create();
    private RDFConnection rdf = new RDFConnectionLocal(ds);
    private ShaclValidator validator;

    @Mock
    private ViolationHandler violationHandler;

    @Before
    public void setUp() {
        initVocabularies(rdf);
        validator = new ShaclValidator(rdf, Quad.defaultGraphIRI, Vocabularies.VOCABULARY_GRAPH_URI);
    }


    @Test
    public void validateNoChanges() {
        validator.validate(EMPTY, EMPTY, violationHandler);
        verifyZeroInteractions(violationHandler);
    }

    @Test
    public void validateResourceWithNoType() {
        validator.validate(EMPTY, createDefaultModel()
                        .add(resource1, RDFS.label, createTypedLiteral(123)),
                violationHandler);

        verifyZeroInteractions(violationHandler);
    }

    @Test
    public void validateResourceWithInvalidProperties() {
        validator.validate(EMPTY, createDefaultModel()
                        .add(resource1, RDF.type, FS.User)
                        .add(resource1, RDFS.label, createTypedLiteral(123))
                        .add(resource1, RDFS.comment, createTypedLiteral(123)),
                violationHandler);

        verify(violationHandler).onViolation("Value does not have datatype xsd:string",
                resource1,
                RDFS.comment,
                createTypedLiteral(123));

        verify(violationHandler).onViolation("Value does not have datatype xsd:string",
                resource1,
                RDFS.label,
                createTypedLiteral(123));

        verifyNoMoreInteractions(violationHandler);
    }

    @Test
    public void validateResourceWithUnknownProperty() {
        validator.validate(EMPTY, createDefaultModel()
                        .add(resource1, RDF.type, FS.User)
                        .add(resource1, createProperty("http://example.com#unknown"), createTypedLiteral(123)),
                violationHandler);

        verify(violationHandler).onViolation("Predicate <http://example.com#unknown> is not allowed (closed shape)",
                resource1,
                createProperty("http://example.com#unknown"),
                createTypedLiteral(123));
    }

    @Test
    public void validateResourceMissingRequiredProperty() {
        validator.validate(EMPTY, createDefaultModel()
                        .add(resource1, RDF.type, FS.File),
                violationHandler);

        verify(violationHandler).onViolation("Less than 1 values",
                resource1,
                FS.filePath,
                null);
    }

    @Test
    public void validateResourceWithWrongObjectsType() {
        validator.validate(EMPTY, createDefaultModel()
                        .add(resource1, RDF.type, FS.File)
                        .add(resource1, FS.filePath, createTypedLiteral(123)),
                violationHandler);

        verify(violationHandler).onViolation("Value does not have datatype xsd:string",
                resource1,
                FS.filePath,
                createTypedLiteral(123));
    }

    @Test
    public void canPerformTypeChecks() {
        ds.getDefaultModel()
                .add(resource2, RDF.type, FS.User);

        var model = createDefaultModel()
                .add(resource1, RDF.type, FS.File)
                .add(resource1, FS.filePath, createStringLiteral("some/path"))
                .add(resource1, FS.createdBy, resource2);

        validator.validate(EMPTY, model, violationHandler);

        verifyZeroInteractions(violationHandler);

        ds.getDefaultModel()
                .remove(resource2, RDF.type, FS.User)
                .add(resource2, RDF.type, FOAF.Person);

        validator.validate(EMPTY, model, violationHandler);

        verify(violationHandler).onViolation("Value does not have class fs:User",
                resource1,
                FS.createdBy,
                resource2);
    }


    @Test
    public void blankNodesAreProperlyValidated() {
        // If the update contains a blank node, it should be validated solely with the
        // information from the update, as there can not be any triple in the database
        // already that references this blank node
        Resource blankNode = createResource();
        Model model = createDefaultModel()
                .add(blankNode, RDF.type, FS.User)
                .add(blankNode, FS.md5, "test");

        validator.validate(EMPTY, model, violationHandler);

        verify(violationHandler).onViolation("Predicate <http://fairspace.io/ontology#md5> is not allowed (closed shape)",
                blankNode,
                FS.md5,
                ResourceFactory.createStringLiteral("test"));
    }

    @Test
    public void blankNodesAreNotFetchedFromTheDatabase() {
        // If the update contains a blank node, it should be validated solely with the
        // information from the update, as there can not be any triple in the database
        // already that references this blank node
        ds.getDefaultModel()
                .add(resource2, RDF.type, FS.User)
                .add(ResourceFactory.createResource(), RDF.type, FS.Collection);

        Resource blankNode = createResource();
        var model = createDefaultModel()
                .add(blankNode, RDF.type, FS.User)
                .add(blankNode, RDFS.label, createTypedLiteral("My label"));

        validator.validate(EMPTY, model, violationHandler);

        verifyZeroInteractions(violationHandler);
    }
}
