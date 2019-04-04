package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.PermissionsService;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class PermissionCheckingValidatorTest {
    private static final Model EMPTY = createDefaultModel();

    private static final Statement STATEMENT = createStatement(
            createResource("http://ex.com/subject"),
            createProperty("http://ex.com/predicate"),
            createResource("http://ex.com/object"));

    @Mock
    private PermissionsService permissions;


    private PermissionCheckingValidator validator;

    private Model model = createDefaultModel();

    @Before
    public void setUp() {
        var ds = DatasetFactory.create();
        validator = new PermissionCheckingValidator(new RDFConnectionLocal(ds), permissions);
    }

    @Test
    public void noChecksShouldBePerformedOnAnEmptyModel() {
        assertEquals(ValidationResult.VALID, validator.validate(EMPTY, model));

        verifyZeroInteractions(permissions);
    }

    @Test
    public void noWritePermissionCausesAFailure() {
        model.add(STATEMENT);

        when(permissions.getPermission(any())).thenReturn(Access.Read);

        assertFalse(validator.validate(EMPTY, model).isValid());
    }

    @Test
    public void ifSubjectIsOkItShouldCheckPredicate() {
        model.add(STATEMENT);

        when(permissions.getPermission(any())).thenReturn(Access.Write);


        assertEquals(ValidationResult.VALID, validator.validate(EMPTY, model));

        verify(permissions).getPermission(STATEMENT.getSubject().asNode());

        verifyNoMoreInteractions(permissions);
    }

    @Test
    public void ifPredicateIsInvertibleItShouldCheckObject() {
        model.add(STATEMENT);

        when(permissions.getPermission(any())).thenReturn(Access.Write);

        assertEquals(ValidationResult.VALID, validator.validate(EMPTY, model));

        verify(permissions).getPermission(STATEMENT.getSubject().asNode());
        verify(permissions).getPermission(STATEMENT.getObject().asNode());

        verifyNoMoreInteractions(permissions);
    }

    @Test
    public void invertiblePredicateWithoutWritePermissionForObjectCausesAFailure() {
        model.add(STATEMENT);

        when(permissions.getPermission(eq(STATEMENT.getSubject().asNode()))).thenReturn(Access.Write);
        when(permissions.getPermission(eq(STATEMENT.getObject().asNode()))).thenReturn(Access.Read);

        assertFalse(validator.validate(EMPTY, model).isValid());

        verify(permissions).getPermission(STATEMENT.getSubject().asNode());
        verify(permissions).getPermission(STATEMENT.getObject().asNode());

        verifyNoMoreInteractions(permissions);
    }
}