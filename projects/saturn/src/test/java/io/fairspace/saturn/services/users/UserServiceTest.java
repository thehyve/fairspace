package io.fairspace.saturn.services.users;

import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;

import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.junit.Assert.assertTrue;

public class UserServiceTest {
    private UserService userService;

    private Dataset ds = DatasetFactory.createTxnMem();

    private Node userIri;

    @Before
    public void before() throws IOException {
        userService = new UserService(ds, () -> null, "coordinator");
    }

}
