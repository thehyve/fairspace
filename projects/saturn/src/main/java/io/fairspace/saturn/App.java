package io.fairspace.saturn;

import io.fairspace.saturn.services.metadata.MetadataAPIServlet;
import org.apache.jena.fuseki.main.FusekiServer;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.tdb2.TDB2Factory;

public class App {
    public static void main(String[] args) {
        Dataset ds = TDB2Factory.connectDataset("/data/saturn/db");
        RDFConnection connection = new RDFConnectionLocal(ds);
        FusekiServer.create()
                .add("/rdf", ds)
                .addServlet("/statements", new MetadataAPIServlet(connection))
                .port(8080)
                .build()
                .start();

        System.out.println("Fuseki is running on :8080/rdf");
        System.out.println("Metadata API is running on :8080/statements");
    }
}
