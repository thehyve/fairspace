package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.rdf.Vocabulary;
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
import static org.junit.Assert.*;
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
    private Vocabulary vocabulary1;

    @Mock
    private Vocabulary vocabulary2;

    private PermissionCheckingValidator validator;

    private Model model = createDefaultModel();

    @Before
    public void setUp() {
        validator = new PermissionCheckingValidator(permissions, vocabulary1, vocabulary2);
    }

    @Test
    public void noChecksShouldBePerformedOnAnEmptyModel() {
        assertEquals(ValidationResult.VALID, validator.validate(null, model));

        verifyZeroInteractions(permissions, vocabulary1, vocabulary2);
    }

    @Test
    public void noWritePermissionCausesAFailure() {
        model.add(STATEMENT);

        when(permissions.getPermission(any())).thenReturn(Access.Read);

        assertFalse(validator.validate(null, model).isValid());
    }

    @Test
    public void ifSubjectIsOkItShouldCheckPredicate() {
        model.add(STATEMENT);

        when(permissions.getPermission(any())).thenReturn(Access.Write);
        when(vocabulary1.isInvertiblePredicate(any())).thenReturn(false);
        when(vocabulary2.isInvertiblePredicate(any())).thenReturn(false);

        assertEquals(ValidationResult.VALID, validator.validate(null, model));

        verify(permissions).getPermission(STATEMENT.getSubject().asNode());
        verify(vocabulary1).isInvertiblePredicate(STATEMENT.getPredicate().getURI());
        verify(vocabulary2).isInvertiblePredicate(STATEMENT.getPredicate().getURI());
        verifyNoMoreInteractions(permissions, vocabulary1, vocabulary2);
    }

    @Test
    public void ifPredicateIsInvertibleItShouldCheckObject() {
        model.add(STATEMENT);

        when(permissions.getPermission(any())).thenReturn(Access.Write);
        when(vocabulary1.isInvertiblePredicate(any())).thenReturn(false);
        when(vocabulary2.isInvertiblePredicate(any())).thenReturn(true);

        assertEquals(ValidationResult.VALID, validator.validate(null, model));

        verify(permissions).getPermission(STATEMENT.getSubject().asNode());
        verify(permissions).getPermission(STATEMENT.getObject().asNode());
        verify(vocabulary1).isInvertiblePredicate(STATEMENT.getPredicate().getURI());
        verify(vocabulary2).isInvertiblePredicate(STATEMENT.getPredicate().getURI());
        verifyNoMoreInteractions(permissions, vocabulary1, vocabulary2);
    }

    @Test
    public void invertiblePredicateWithoutWritePermissionForObjectCausesAFailure() {
        model.add(STATEMENT);

        when(permissions.getPermission(eq(STATEMENT.getSubject().asNode()))).thenReturn(Access.Write);
        when(permissions.getPermission(eq(STATEMENT.getObject().asNode()))).thenReturn(Access.Read);
        when(vocabulary1.isInvertiblePredicate(any())).thenReturn(false);
        when(vocabulary2.isInvertiblePredicate(any())).thenReturn(true);

        assertFalse(validator.validate(null, model).isValid());

        verify(permissions).getPermission(STATEMENT.getSubject().asNode());
        verify(permissions).getPermission(STATEMENT.getObject().asNode());
        verify(vocabulary1).isInvertiblePredicate(STATEMENT.getPredicate().getURI());
        verify(vocabulary2).isInvertiblePredicate(STATEMENT.getPredicate().getURI());
        verifyNoMoreInteractions(permissions, vocabulary1, vocabulary2);
    }
}