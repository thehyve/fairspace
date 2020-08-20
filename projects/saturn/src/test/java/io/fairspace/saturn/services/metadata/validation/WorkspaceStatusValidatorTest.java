package io.fairspace.saturn.services.metadata.validation;

import io.fairspace.saturn.services.workspaces.WorkspaceStatus;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
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
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class WorkspaceStatusValidatorTest {

    @Mock
    private ViolationHandler violationHandler;

    private WorkspaceStatusValidator validator;;
    private Model vocabulary;
    Model before;
    Resource resource;

    @Before
    public void setUp() {
        validator = new WorkspaceStatusValidator();
        vocabulary = createDefaultModel();
        before = createDefaultModel();
        resource = before.createResource("http://example.com/w123");
        resource.addProperty(RDF.type, FS.Workspace);
    }

    @Test
    public void activeWorkspaceCanBeModified() {
        resource.addProperty(FS.status, WorkspaceStatus.Active.name());
        var toAdd = modelOf(resource, RDFS.comment, createTypedLiteral(123));

        validator.validate(before, before.union(toAdd), EMPTY_MODEL, toAdd, vocabulary, violationHandler);

        verifyNoInteractions(violationHandler);
    }

    @Test
    public void archivedWorkspaceCannotBeModified() {
        resource.addProperty(FS.status, WorkspaceStatus.Archived.name());
        var toAdd = modelOf(resource, RDFS.comment, createTypedLiteral(123));

        validator.validate(before, before.union(toAdd), EMPTY_MODEL, toAdd, vocabulary, violationHandler);

        verify(violationHandler).onViolation("Cannot modify inactive resource", resource, null, null);
        verifyNoMoreInteractions(violationHandler);
    }

    @Test
    public void statusOfArchivedWorkspaceCanBeModified() {
        resource.addProperty(FS.status, WorkspaceStatus.Archived.name());
        var toAdd = modelOf(resource, FS.status, createTypedLiteral(WorkspaceStatus.Active.name()));

        validator.validate(before, before.union(toAdd), EMPTY_MODEL, toAdd, vocabulary, violationHandler);

        verifyNoInteractions(violationHandler);
    }
}
