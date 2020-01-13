package io.fairspace.saturn.services.users;

import io.fairspace.saturn.ThreadContext;
import org.apache.jena.query.Dataset;
import org.junit.Before;
import org.junit.Test;

import java.util.List;
import java.util.Set;

import static io.fairspace.saturn.ThreadContext.setThreadContext;
import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.junit.Assert.*;

public class UserServiceTest {

    private Dataset ds = createTxnMem();

    private UserService userService = new UserService(ds, null);

    private User coordinator = new User();
    private User regular1 = new User();
    private User regular2 = new User();

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
    }

    @Test
    public void coordinatorCanSaveItself() {
        assertNotNull(userService.trySetCurrentUser(coordinator));
        assertEquals(Set.of(coordinator), userService.getUsers());
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
        assertNotNull(userService.updateUser(regular1));
        assertEquals(Set.of(Role.CanRead, Role.CanWrite), regular1.getRoles());
    }

    @Test(expected = IllegalArgumentException.class)
    public void sameUserCanNotBeAddedTwice() {
        setThreadContext(new ThreadContext(coordinator, null, null, null));
        assertNotNull(userService.addUser(regular1));
        assertNotNull(userService.addUser(regular1));
        assertEquals(Set.of(Role.CanRead, Role.CanWrite), regular1.getRoles());
    }

    @Test(expected = IllegalArgumentException.class)
    public void regularUserCanNotAddUsers() {
        setThreadContext(new ThreadContext(regular1, null, null, null));
        userService.addUser(regular2);
    }
}
