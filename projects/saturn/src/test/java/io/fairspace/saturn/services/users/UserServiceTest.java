package io.fairspace.saturn.services.users;

import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.junit.Before;

import java.io.IOException;

import static org.apache.jena.query.DatasetFactory.createTxnMem;

public class UserServiceTest {

    private Dataset ds = createTxnMem();

    private UserService userService = new UserService(ds);

    private Node userIri;

    @Before
    public void before() throws IOException {

    }

}
