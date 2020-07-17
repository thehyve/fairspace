package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.services.metadata.MetadataPermissions;
import org.apache.jena.rdf.model.Statement;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static io.fairspace.saturn.rdf.ModelUtils.EMPTY_MODEL;
import static io.fairspace.saturn.rdf.ModelUtils.modelOf;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class PermissionCheckingValidatorTest {

    private static final Statement STATEMENT = createStatement(
            createResource("http://ex.com/subject"),
            createProperty("http://ex.com/predicate"), // does not have an inverse
            createResource("http://ex.com/object"));


    @Mock
    private MetadataPermissions permissions;
    @Mock
    private ViolationHandler violationHandler;

    private PermissionCheckingValidator validator;

    @Before
    public void setUp() {
        validator = new PermissionCheckingValidator(permissions);
    }


    @Test
    public void noChecksShouldBePerformedOnAnEmptyModel() {
        validator.validate(EMPTY_MODEL, EMPTY_MODEL, EMPTY_MODEL, EMPTY_MODEL, null, violationHandler);

        verifyNoInteractions(permissions);
        verifyNoMoreInteractions(violationHandler);
    }

    @Test
    public void noWritePermissionCausesAFailure() {
        var model = modelOf(STATEMENT);
        when(permissions.canWriteMetadata(any())).thenReturn(false);
        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, null, violationHandler);
        verify(violationHandler).onViolation("Cannot modify resource", STATEMENT.getSubject(), null, null);
    }

    @Test
    public void itShouldCheckPermissionsForAddedSubject() {
        when(permissions.canWriteMetadata(any())).thenReturn(true);

        var model = modelOf(STATEMENT);

        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, null, violationHandler);

        verifyNoInteractions(violationHandler);
        verify(permissions).canWriteMetadata(eq(STATEMENT.getSubject()));

        verifyNoMoreInteractions(permissions);
    }

    @Test
    public void itShouldCheckPermissionsForRemovedSubject() {
        when(permissions.canWriteMetadata(any())).thenReturn(true);
        var model = modelOf(STATEMENT);

        validator.validate(EMPTY_MODEL, model, model, EMPTY_MODEL, null, violationHandler);

        verifyNoInteractions(violationHandler);
        verify(permissions).canWriteMetadata(STATEMENT.getSubject());

        verifyNoMoreInteractions(permissions);
    }
}
