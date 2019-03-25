package io.fairspace.saturn.services.users;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.rdf.dao.DAO;
import org.apache.jena.graph.Node;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.Set;

import static java.util.Collections.singletonList;
import static junit.framework.TestCase.assertEquals;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class UserServiceTest {
    private static final Node IRI = createURI("http://fairspace.io/iri/123");
    private static final UserInfo userInfo = new UserInfo("123", "user1", "name1", "user1@host.com", Set.of("role1", "role2"));
    private static User user;

    @Mock
    private DAO dao;
    private UserService service;


    @BeforeClass
    public static void before() {
        user = new User();
        user.setIri(IRI);
        user.setName(userInfo.getFullName());
        user.setEmail(userInfo.getEmail());

    }

    @Test
    public void shouldCreateAnIRIForANewUserAndThenStoreAndReuseIt() {
        service = new UserService(dao);

        when(dao.write(any(User.class)))
                .thenAnswer(invocation -> withIri(invocation.getArgument(0)));

        var iri = service.getUserIRI(userInfo);

        verify(dao, times(1)).write(argThat(e ->
                e.getIri().equals(IRI)
                && e instanceof User
                && ((User)e).getName().equals(userInfo.getFullName())
                && e.getIri().getURI().endsWith(userInfo.getUserId())
                && ((User)e).getEmail().equals(userInfo.getEmail())));

        assertEquals(iri, service.getUserIRI(userInfo));
    }



    @Test
    public void shouldLoadPreviouslyCreatedUsersOnStart() {
        when(dao.list(eq(User.class))).thenReturn(singletonList(user));
        service = new UserService(dao);

        var iri = service.getUserIRI(userInfo);
        assertEquals(IRI, iri);
        verify(dao, times(0)).write(any());
    }


    @Test
    public void shouldUpdateMetadataWhenNeeded() {
        when(dao.list(eq(User.class))).thenReturn(singletonList(user));
        service = new UserService(dao);

        var updatedUserInfo = new UserInfo("123", "user2", "name2", "user2@host.com", Set.of("role1", "role2", "role3"));
        service.getUserIRI(updatedUserInfo);

        var updatedUser = new User();
        updatedUser.setIri(IRI);
        updatedUser.setName(updatedUserInfo.getFullName());
        updatedUser.setEmail(updatedUserInfo.getEmail());

        verify(dao, times(1)).write(eq(updatedUser));
    }

    private static User withIri(User user) {
        user.setIri(IRI);
        return user;
    }
}