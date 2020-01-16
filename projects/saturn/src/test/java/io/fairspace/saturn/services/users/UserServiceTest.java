package io.fairspace.saturn.services.users;

import io.fairspace.saturn.ThreadContext;
import io.fairspace.saturn.rdf.transactions.DatasetJobSupport;
import io.fairspace.saturn.rdf.transactions.DatasetJobSupportInMemory;
import org.junit.Before;
import org.junit.Test;

import java.util.EnumSet;
import java.util.Set;

import static io.fairspace.saturn.ThreadContext.setThreadContext;
import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static org.apache.jena.sparql.core.DatasetGraphFactory.createTxnMem;
import static org.junit.Assert.*;

public class UserServiceTest {

    private DatasetJobSupport ds = new DatasetJobSupportInMemory();

    private UserService userService = new UserService(ds, null);

    private User coordinator = new User();
    private User regular1 = new User();
    private User regular2 = new User();
    private User admin = new User();

    @Before
    public void before() {
        coordinator.setIri(generateMetadataIri("1"));
        coordinator.setName("Coordinator");
        coordinator.getRoles().add(Role.Coordinator);

        regular1.setIri(generateMetadataIri("2"));
        regular1.setName("Regular1");
        regular1.getRoles().add(Role.CanRead);

        regular2.setIri(generateMetadataIri("3"));
        regular2.setName("Regular2");
        regular2.getRoles().add(Role.CanRead);

        admin.setIri(generateMetadataIri("4"));
        admin.setName("Admin");
        admin.setAdmin(true);
    }

    @Test
    public void adminHasAllRoles() {
        assertNotNull(userService.trySetCurrentUser(admin));
        assertEquals(EnumSet.allOf(Role.class), admin.getRoles());
    }

    @Test
    public void regularUserCanNotSaveItself() {
        assertNull(userService.trySetCurrentUser(regular1));
        assertEquals(Set.of(), userService.getUsers());
    }

    @Test
    public void coordinatorCanAddUsers() {
        setThreadContext(new ThreadContext(coordinator, null, null, null));
        assertNotNull(userService.addUser(regular1));
    }

    @Test
    public void coordinatorCanGrantRoles() {
        setThreadContext(new ThreadContext(coordinator, null, null, null));
        assertNotNull(userService.addUser(regular1));
        regular1.getRoles().add(Role.CanWrite);
        assertNotNull(userService.addUser(regular1));
        assertEquals(Set.of(Role.CanRead, Role.CanWrite), regular1.getRoles());
    }

    @Test(expected = IllegalArgumentException.class)
    public void regularUserCanNotAddUsers() {
        setThreadContext(new ThreadContext(regular1, null, null, null));
        userService.addUser(regular2);
    }
}
