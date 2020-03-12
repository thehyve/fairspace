package io.fairspace.saturn.services.users;

import io.fairspace.saturn.rdf.transactions.DatasetJobSupport;
import io.fairspace.saturn.rdf.transactions.DatasetJobSupportInMemory;
import org.junit.Before;
import org.junit.Test;

import java.util.Set;

import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static io.fairspace.saturn.services.users.User.setCurrentUser;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class UserServiceTest {

    private DatasetJobSupport ds = new DatasetJobSupportInMemory();

    private UserService userService = new UserService(ds);

    private User coordinator = new User();
    private User regular1 = new User();
    private User regular2 = new User();

    @Before
    public void before() {
        coordinator.setId("1");
        coordinator.setIri(generateMetadataIri("1"));
        coordinator.setName("Coordinator");
        coordinator.getRoles().add(Role.Coordinator);

        regular1.setId("2");
        regular1.setName("Regular1");
        regular1.getRoles().add(Role.CanRead);

        regular2.setId("3");
        regular2.setName("Regular2");
        regular2.getRoles().add(Role.CanRead);
    }

    @Test
    public void coordinatorCanAddUsers() {
        setCurrentUser(coordinator);
        assertNotNull(userService.addUser(regular1));
    }

    @Test
    public void coordinatorCanGrantRoles() {
        setCurrentUser(coordinator);
        assertNotNull(userService.addUser(regular1));
        regular1.getRoles().add(Role.CanWrite);
        assertNotNull(userService.addUser(regular1));
        assertEquals(Set.of(Role.CanRead, Role.CanWrite), regular1.getRoles());
    }

    @Test(expected = IllegalArgumentException.class)
    public void regularUserCanNotAddUsers() {
        setCurrentUser(regular1);
        userService.addUser(regular2);
    }
}
