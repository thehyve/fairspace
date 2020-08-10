package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.mail.MailService;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.MakeCollectionableResource;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.mockito.Mock;

import java.util.Arrays;

import static io.fairspace.saturn.TestUtils.setupRequestContext;
import static io.fairspace.saturn.auth.RequestContext.VIEW_PUBLIC_DATA;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.junit.Assert.assertEquals;

@RunWith(Parameterized.class)
public class DavFactoryAccessTest {
    public static final String BASE_PATH = "/api/v1/webdav";
    private static final String baseUri = "http://example.com" + BASE_PATH;
    @Mock
    BlobStore store;
    @Mock
    MailService mailService;
    private ResourceFactory factory;
    private Model model = createTxnMem().getDefaultModel();

    private Access grantedAccess;
    private Status status;
    private AccessMode accessMode;
    private Access expectedAccess;

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
                { Access.Manage, Status.Archived, AccessMode.Restricted, Access.Read },
                { Access.Manage, Status.Closed, AccessMode.Restricted, Access.List },
                { Access.Manage, Status.Active, AccessMode.DataPublished, Access.Read },
                { Access.Manage, Status.Active, AccessMode.MetadataPublished, Access.Manage },
                { Access.Write, Status.Active, AccessMode.Restricted, Access.Write },
                { Access.Write, Status.Archived, AccessMode.Restricted, Access.Read },
                { Access.Write, Status.Closed, AccessMode.Restricted, Access.List },
                { Access.Write, Status.Active, AccessMode.DataPublished, Access.Read },
                { Access.Write, Status.Active, AccessMode.MetadataPublished, Access.Write },
                { Access.Read, Status.Active, AccessMode.Restricted, Access.Read },
                { Access.Read, Status.Archived, AccessMode.Restricted, Access.Read },
                { Access.Read, Status.Closed, AccessMode.Restricted, Access.List },
                { Access.Read, Status.Active, AccessMode.DataPublished, Access.Read },
                { Access.Read, Status.Active, AccessMode.MetadataPublished, Access.Read },
                { Access.List, Status.Active, AccessMode.Restricted, Access.List },
                { Access.List, Status.Archived, AccessMode.Restricted, Access.List },
                { Access.List, Status.Closed, AccessMode.Restricted, Access.List },
                { Access.List, Status.Active, AccessMode.DataPublished, Access.Read },
                { Access.List, Status.Active, AccessMode.MetadataPublished, Access.List },
                { Access.None, Status.Active, AccessMode.Restricted, Access.None },
                { Access.None, Status.Archived, AccessMode.Restricted, Access.None },
                { Access.None, Status.Closed, AccessMode.Restricted, Access.None },
                { Access.None, Status.Active, AccessMode.DataPublished, Access.Read },
                { Access.None, Status.Active, AccessMode.MetadataPublished, Access.List }
        });
    }

    @Before
    public void before() {
        setupRequestContext(VIEW_PUBLIC_DATA);
        factory = new DavFactory(model.createResource(baseUri), store, mailService);
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
