package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.PermissionsService;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.Set;
import java.util.function.Function;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class PermissionCheckingValidatorTest {
    private static final Statement STATEMENT = createStatement(
            createResource("http://ex.com/subject"),
            createProperty("http://ex.com/predicate"),
            createResource("http://ex.com/object"));

    @Mock
    private PermissionsService permissions;

    @Mock
    private Function<Model, Set<Resource>> affectedResourcesDetector;

    private PermissionCheckingValidator validator;

    private Model model = createDefaultModel();

    @Before
    public void setUp() {
        validator = new PermissionCheckingValidator(permissions, affectedResourcesDetector);
    }

    @Test
    public void noChecksShouldBePerformedOnAnEmptyModel() {
        when(affectedResourcesDetector.apply(any())).thenReturn(Set.of());
        assertEquals(ValidationResult.VALID, validator.validate(null, model));
        verifyZeroInteractions(permissions);
    }

    @Test
    public void noWritePermissionCausesAFailure() {
        model.add(STATEMENT);

        when(permissions.getPermission(any())).thenReturn(Access.Read);
        when(affectedResourcesDetector.apply(any())).thenReturn(Set.of(STATEMENT.getSubject()));

        assertFalse(validator.validate(null, model).isValid());
    }

    @Test
    public void ifSubjectIsOkItShouldCheckPredicate() {
        model.add(STATEMENT);

        when(permissions.getPermission(any())).thenReturn(Access.Write);
        when(affectedResourcesDetector.apply(any())).thenReturn(Set.of(STATEMENT.getSubject()));

        assertEquals(ValidationResult.VALID, validator.validate(null, model));

        verify(permissions).getPermission(STATEMENT.getSubject().asNode());
        verify(affectedResourcesDetector).apply(null);
        verify(affectedResourcesDetector).apply(model);
        verifyNoMoreInteractions(permissions, affectedResourcesDetector);
    }

    @Test
    public void ifPredicateIsInvertibleItShouldCheckObject() {
        model.add(STATEMENT);

        when(permissions.getPermission(any())).thenReturn(Access.Write);
        when(affectedResourcesDetector.apply(any())).thenReturn(Set.of(STATEMENT.getSubject(), STATEMENT.getObject().asResource()));

        assertEquals(ValidationResult.VALID, validator.validate(null, model));

        verify(permissions).getPermission(STATEMENT.getSubject().asNode());
        verify(permissions).getPermission(STATEMENT.getObject().asNode());
        verify(affectedResourcesDetector).apply(null);
        verify(affectedResourcesDetector).apply(model);
        verifyNoMoreInteractions(permissions, affectedResourcesDetector);
    }

    @Test
    public void invertiblePredicateWithoutWritePermissionForObjectCausesAFailure() {
        model.add(STATEMENT);

        when(permissions.getPermission(eq(STATEMENT.getSubject().asNode()))).thenReturn(Access.Write);
        when(permissions.getPermission(eq(STATEMENT.getObject().asNode()))).thenReturn(Access.Read);
        when(affectedResourcesDetector.apply(any())).thenReturn(Set.of(STATEMENT.getSubject(), STATEMENT.getObject().asResource()));

        assertFalse(validator.validate(null, model).isValid());

        verify(permissions).getPermission(STATEMENT.getSubject().asNode());
        verify(permissions).getPermission(STATEMENT.getObject().asNode());
        verify(affectedResourcesDetector).apply(null);
        verify(affectedResourcesDetector).apply(model);
        verifyNoMoreInteractions(permissions, affectedResourcesDetector);
    }
}