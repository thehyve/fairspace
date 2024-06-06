package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import io.fairspace.saturn.vocabulary.FS;

import static io.fairspace.saturn.rdf.ModelUtils.EMPTY_MODEL;
import static io.fairspace.saturn.rdf.ModelUtils.modelOf;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

@RunWith(MockitoJUnitRunner.class)
public class DeletionValidatorTest {

    @Mock
    private ViolationHandler violationHandler;

    private DeletionValidator validator;

    @Before
    public void setUp() {
        validator = new DeletionValidator();
    }

    @Test
    public void deletedResourcesCannotBeModified() {
        Model before = createDefaultModel();
        Resource resource1 = before.createResource("http://example.com/123");
        resource1.addProperty(FS.dateDeleted, "2019-02-03").addProperty(FS.deletedBy, "someone");

        var toAdd = modelOf(resource1, RDFS.comment, createTypedLiteral(123));

        validator.validate(before, before.union(toAdd), EMPTY_MODEL, toAdd, violationHandler);

        verify(violationHandler).onViolation("Cannot modify deleted resource", resource1, null, null);
        verifyNoMoreInteractions(violationHandler);
    }
}
