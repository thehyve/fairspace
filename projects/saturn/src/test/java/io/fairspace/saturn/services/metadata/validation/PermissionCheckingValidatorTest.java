package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.PermissionsService;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class PermissionCheckingValidatorTest {
    private static final Model EMPTY = createDefaultModel();

    private static final Statement STATEMENT = createStatement(
            createResource("http://ex.com/subject"),
            createProperty("http://ex.com/predicate"), // does not have an inverse
            createResource("http://ex.com/object"));


    @Mock
    private PermissionsService permissions;

    @Mock
    private ViolationHandler violationHandler;


    private PermissionCheckingValidator validator;

    private Model model = createDefaultModel();

    @Before
    public void setUp() {
        validator = new PermissionCheckingValidator(permissions);
    }

    @Test
    public void noChecksShouldBePerformedOnAnEmptyModel() {
        validator.validate(EMPTY, EMPTY, violationHandler);

        verifyZeroInteractions(permissions, violationHandler);
    }

    @Test
    public void noWritePermissionCausesAFailure() {
        model.add(STATEMENT);

        when(permissions.getPermission(any())).thenReturn(Access.Read);
        validator.validate(EMPTY, model, violationHandler);
        verify(violationHandler).onViolation("Cannot modify read-only resource http://ex.com/subject", STATEMENT.getSubject(), null, null);
    }

    @Test
    public void itShouldCheckPermissionsForSubject() {
        model.add(STATEMENT);

        when(permissions.getPermission(eq(STATEMENT.getSubject().asNode()))).thenReturn(Access.Write);

        validator.validate(EMPTY, model, violationHandler);

        verifyZeroInteractions(violationHandler);
        verify(permissions).getPermission(STATEMENT.getSubject().asNode());

        verifyNoMoreInteractions(permissions);
    }
}
