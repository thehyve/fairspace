package io.fairspace.saturn.services.users;

import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.junit.Before;

import java.io.IOException;

public class UserServiceTest {


    private Dataset ds = DatasetFactory.createTxnMem();

    private UserService userService = new UserService(ds, "coordinator");

    private Node userIri;

    @Before
    public void before() throws IOException {

    }

}
