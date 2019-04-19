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

import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;
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
            createProperty("http://ex.com/predicate"), // does not have an inverse
            createResource("http://ex.com/object"));


    @Mock
    private PermissionsService permissions;


    private PermissionCheckingValidator validator;

    private Model model = createDefaultModel();

    @Before
    public void setUp() {
        var rdf = new RDFConnectionLocal(DatasetFactory.create());
        initVocabularies(rdf);
        validator = new PermissionCheckingValidator(rdf, permissions);
    }

    @Test
    public void noChecksShouldBePerformedOnAnEmptyModel() {
        assertEquals(ValidationResult.VALID, validator.validate(EMPTY, EMPTY));

        verifyZeroInteractions(permissions);
    }

    @Test
    public void noWritePermissionCausesAFailure() {
        model.add(STATEMENT);

        when(permissions.getPermission(any())).thenReturn(Access.Read);

        assertFalse(validator.validate(EMPTY, model).isValid());
    }

    @Test
    public void itShouldCheckPermissionsForSubject() {
        model.add(STATEMENT);

        when(permissions.getPermission(eq(STATEMENT.getSubject().asNode()))).thenReturn(Access.Write);

        assertEquals(ValidationResult.VALID, validator.validate(EMPTY, model));

        verify(permissions).getPermission(STATEMENT.getSubject().asNode());

        verifyNoMoreInteractions(permissions);
    }
}
