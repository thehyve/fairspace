package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static io.fairspace.saturn.rdf.ModelUtils.EMPTY_MODEL;
import static io.fairspace.saturn.rdf.ModelUtils.modelOf;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

@RunWith(MockitoJUnitRunner.class)
public class URIPrefixValidatorTest {

    @Mock
    private ViolationHandler violationHandler;

    private URIPrefixValidator validator;

    @Before
    public void setUp() {
        validator = new URIPrefixValidator("http://example.com/api/v1/webdav");
    }

    @Test
    public void resourcesWithRestrictedPrefixCannotBeCreated() {
        Model before = createDefaultModel();
        Resource resource1 = before.createResource("http://example.com/api/v1/webdav/123");

        var toAdd = modelOf(resource1, RDFS.comment,  createTypedLiteral(123));

        validator.validate(before, before.union(toAdd), EMPTY_MODEL, toAdd, violationHandler);

        verify(violationHandler).onViolation(
                "Cannot add resource with URI starting with restricted prefix 'http://example.com/api/v1/webdav'.",
                resource1, null, null);
        verifyNoMoreInteractions(violationHandler);
    }
}
