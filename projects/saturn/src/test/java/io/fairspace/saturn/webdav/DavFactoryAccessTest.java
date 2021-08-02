package io.fairspace.saturn.webdav;

import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.users.User;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.services.workspaces.Workspace;
import io.fairspace.saturn.services.workspaces.WorkspaceRole;
import io.fairspace.saturn.services.workspaces.WorkspaceService;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.MakeCollectionableResource;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.sparql.util.Context;
import org.eclipse.jetty.server.Authentication;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import java.util.Arrays;

import static io.fairspace.saturn.TestUtils.*;
import static io.fairspace.saturn.auth.RequestContext.getCurrentRequest;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.*;

@RunWith(Parameterized.class)
public class DavFactoryAccessTest {
    public static final String BASE_PATH = "/api/webdav";
    private static final String baseUri = "http://example.com" + BASE_PATH;
    BlobStore store = mock(BlobStore.class);
    UserService userService = mock(UserService.class);
    WorkspaceService workspaceService;

    User user;
    Authentication.User userAuthentication;
    User admin;
    Authentication.User adminAuthentication;

    private org.eclipse.jetty.server.Request request;
    private ResourceFactory factory;
    private Dataset ds = createTxnMem();
    private Transactions tx = new SimpleTransactions(ds);
    private Model model = ds.getDefaultModel();

    private Access grantedAccess;
    private Status status;
    private AccessMode accessMode;
    private Access expectedAccess;
    private Context context = new Context();

    public DavFactoryAccessTest(Access grantedAccess, Status status, AccessMode accessMode, Access expectedAccess) {
        this.grantedAccess = grantedAccess;
        this.status = status;
        this.accessMode = accessMode;
        this.expectedAccess = expectedAccess;
    }

    @Parameterized.Parameters(name = "{index}: access(granted:{0}, status:{1}, mode:{2}) = {3}")
    public static Iterable<Object[]> data() {
        return Arrays.asList(new Object[][] {
                { Access.Manage, Status.Active, AccessMode.Restricted, Access.Manage },
                { Access.Manage, Status.ReadOnly, AccessMode.Restricted, Access.Read },
                { Access.Manage, Status.Archived, AccessMode.Restricted, Access.List },
                { Access.Manage, Status.Active, AccessMode.DataPublished, Access.Read },
                { Access.Manage, Status.Active, AccessMode.MetadataPublished, Access.Manage },
                { Access.Write, Status.Active, AccessMode.Restricted, Access.Write },
                { Access.Write, Status.ReadOnly, AccessMode.Restricted, Access.Read },
                { Access.Write, Status.Archived, AccessMode.Restricted, Access.List },
                { Access.Write, Status.Active, AccessMode.DataPublished, Access.Read },
                { Access.Write, Status.Active, AccessMode.MetadataPublished, Access.Write },
                { Access.Read, Status.Active, AccessMode.Restricted, Access.Read },
                { Access.Read, Status.ReadOnly, AccessMode.Restricted, Access.Read },
                { Access.Read, Status.Archived, AccessMode.Restricted, Access.List },
                { Access.Read, Status.Active, AccessMode.DataPublished, Access.Read },
                { Access.Read, Status.Active, AccessMode.MetadataPublished, Access.Read },
                { Access.List, Status.Active, AccessMode.Restricted, Access.List },
                { Access.List, Status.ReadOnly, AccessMode.Restricted, Access.List },
                { Access.List, Status.Archived, AccessMode.Restricted, Access.List },
                { Access.List, Status.Active, AccessMode.DataPublished, Access.Read },
                { Access.List, Status.Active, AccessMode.MetadataPublished, Access.List },
                { Access.None, Status.Active, AccessMode.Restricted, Access.None },
                { Access.None, Status.ReadOnly, AccessMode.Restricted, Access.None },
                { Access.None, Status.Archived, AccessMode.Restricted, Access.None },
                { Access.None, Status.Active, AccessMode.DataPublished, Access.Read },
                { Access.None, Status.Active, AccessMode.MetadataPublished, Access.List }
        });
    }

    private void selectRegularUser() {
        lenient().when(request.getAuthentication()).thenReturn(userAuthentication);
        lenient().when(userService.currentUser()).thenReturn(user);
    }

    private void selectAdmin() {
        lenient().when(request.getAuthentication()).thenReturn(adminAuthentication);
        lenient().when(userService.currentUser()).thenReturn(admin);
    }

    @Before
    public void before() {
        workspaceService = new WorkspaceService(tx, userService);
        factory = new DavFactory(model.createResource(baseUri), store, userService, context);

        setupRequestContext();
        request = getCurrentRequest();
        userAuthentication = mockAuthentication("user");
        user = createTestUser("user", false);
        user.setCanViewPublicData(true);
        user.setCanViewPublicMetadata(true);
        new DAO(model).write(user);
        adminAuthentication = mockAuthentication("admin");
        admin = createTestUser("admin", true);
        new DAO(model).write(admin);

        selectAdmin();
        var workspace = workspaceService.createWorkspace(Workspace.builder().code("Test").build());
        workspaceService.setUserRole(workspace.getIri(), user.getIri(), WorkspaceRole.Member);

        selectRegularUser();
        when(request.getHeader("Owner")).thenReturn(workspace.getIri().getURI());
    }

    @Test
    public void whenCollectionAccessStatusAndMode_thenEffectiveAccess()
            throws NotAuthorizedException, BadRequestException, ConflictException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        root.createCollection("coll");
        var resource = model.createResource(baseUri + "/coll");
        var user = ((DavFactory) factory).currentUserResource();
        model.removeAll(null, FS.canManage, resource);

        grantAccess(user, grantedAccess, resource);
        resource.addProperty(FS.accessMode, accessMode.name());
        resource.addProperty(FS.status, status.name());

        assertEquals(expectedAccess, ((DavFactory) factory).getAccess(resource));
    }

    private void grantAccess(Resource principal, Access access, Resource subject) {
        switch (access) {
            case List -> principal.addProperty(FS.canList, subject);
            case Read -> principal.addProperty(FS.canRead, subject);
            case Write -> principal.addProperty(FS.canWrite, subject);
            case Manage -> principal.addProperty(FS.canManage, subject);
        }
    }

}
