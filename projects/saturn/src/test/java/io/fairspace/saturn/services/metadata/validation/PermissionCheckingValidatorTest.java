package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.MetadataAccessDeniedException;
import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.services.workspaces.WorkspaceStatus;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import static io.fairspace.saturn.rdf.ModelUtils.EMPTY_MODEL;
import static io.fairspace.saturn.rdf.ModelUtils.modelOf;
import static junit.framework.TestCase.assertEquals;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class PermissionCheckingValidatorTest {

    private static final Statement STATEMENT = createStatement(
            createResource("http://ex.com/subject"),
            createProperty("http://ex.com/predicate"), // does not have an inverse
            createResource("http://ex.com/object"));


    @Mock
    private PermissionsService permissions;
    @Mock
    private ViolationHandler violationHandler;

    @Captor
    ArgumentCaptor<Node> valueCaptor;

    private PermissionCheckingValidator validator;

    @Before
    public void setUp() {
        validator = new PermissionCheckingValidator(permissions);
    }


    @Test
    public void noChecksShouldBePerformedOnAnEmptyModel() {
        validator.validate(EMPTY_MODEL, EMPTY_MODEL, EMPTY_MODEL, EMPTY_MODEL, null, violationHandler);

        verify(permissions).ensureMinimalAccess(Collections.emptySet(), Access.Write);
        verify(permissions).ensureMinimalAccess(Collections.emptySet(), Access.Manage);
        verifyNoMoreInteractions(violationHandler);
    }

    @Test
    public void noWritePermissionCausesAFailure() {
        var model = modelOf(STATEMENT);
        Set<Node> nodes = Set.of(STATEMENT.getSubject().asNode());

        doThrow(new MetadataAccessDeniedException("", STATEMENT.getSubject().asNode())).when(permissions).ensureMinimalAccess(nodes, Access.Write);
        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, null, violationHandler);
        verify(violationHandler).onViolation("Cannot modify resource", STATEMENT.getSubject(), null, null);
    }

    @Test
    public void itShouldCheckPermissionsForAddedSubject() {
        var model = modelOf(STATEMENT);
        Set<Node> nodes = Set.of(STATEMENT.getSubject().asNode());

        validator.validate(EMPTY_MODEL, model, EMPTY_MODEL, model, null, violationHandler);

        verifyNoInteractions(violationHandler);
        verify(permissions).ensureMinimalAccess(nodes, Access.Write);
        verify(permissions).ensureMinimalAccess(Collections.emptySet(), Access.Manage);

        verifyNoMoreInteractions(permissions);
    }

    @Test
    public void itShouldCheckPermissionsForRemovedSubject() {
        var model = modelOf(STATEMENT);
        Set<Node> nodes = Set.of(STATEMENT.getSubject().asNode());

        validator.validate(EMPTY_MODEL, model, model, EMPTY_MODEL, null, violationHandler);

        verifyNoInteractions(violationHandler);
        nodes.iterator().forEachRemaining(n-> verify(permissions).ensureAdminAccess(n));
        verify(permissions).ensureMinimalAccess(Collections.emptySet(), Access.Write);
        verify(permissions).ensureMinimalAccess(Collections.emptySet(), Access.Manage);

        verifyNoMoreInteractions(permissions);
    }


    @Test
    public void itShouldCheckPermissionsForChangedWorkspaceProperty() {
        var before = createDefaultModel();
        var resource = before.createResource("http://example.com/workspace1");
        resource.addProperty(RDF.type, FS.Workspace);
        var toAdd = modelOf(resource, RDFS.comment, createTypedLiteral(123));
        var toRemove = modelOf(resource, RDFS.label, createTypedLiteral("test"));
        var after = before.union(toAdd).union(toRemove);
        var nodeAdded = toAdd.listSubjects().next().asNode();
        var nodeRemoved = toRemove.listSubjects().next().asNode();

        validator.validate(before, after, toRemove, toAdd, null, violationHandler);

        verify(permissions).ensureMinimalAccess(Set.of(nodeRemoved), Access.Manage);
        verify(permissions).ensureMinimalAccess(Set.of(nodeAdded), Access.Write);

        verifyNoMoreInteractions(permissions);
    }

    @Test
    public void itShouldCheckPermissionsForChangedWorkspaceStatus() {
        var before = createDefaultModel();
        var resource = before.createResource("http://example.com/workspace1");
        resource.addProperty(RDF.type, FS.Workspace);
        var toAdd = modelOf(resource, FS.status, createTypedLiteral(WorkspaceStatus.Active.name()));
        var toRemove = modelOf(resource, FS.status, createTypedLiteral(WorkspaceStatus.Archived.name()));
        var after = before.union(toAdd).union(toRemove);
        var nodeAdded = toAdd.listSubjects().next().asNode();
        var nodeRemoved = toRemove.listSubjects().next().asNode();

        validator.validate(before, after, toRemove, toAdd, null, violationHandler);

        verify(permissions, times(2)).ensureAdminAccess(valueCaptor.capture());
        List<Node> values = valueCaptor.getAllValues();
        assertEquals(Arrays.asList(nodeAdded, nodeRemoved), values);

        verify(permissions).ensureMinimalAccess(Collections.emptySet(), Access.Manage);
        verify(permissions).ensureMinimalAccess(Collections.emptySet(), Access.Write);

        verifyNoMoreInteractions(permissions);
    }

}
