package io.fairspace.saturn;

import org.apache.jena.fuseki.main.FusekiServer;
import org.apache.jena.tdb2.TDB2Factory;

import java.io.File;

public class App {
    private static final String DEFAULT_DATASET_PATH = "/data/saturn/db";
    private static final String LOCAL_DATASET_PATH = "db";

    public static void main(String[] args) {
        System.out.println("Saturn is starting");

        String datasetPath = new File(DEFAULT_DATASET_PATH).exists() ? DEFAULT_DATASET_PATH : LOCAL_DATASET_PATH;

        FusekiServer.create()
                .add("/rdf", TDB2Factory.connectDataset(datasetPath))
                .port(8080)
                .build()
                .start();

        System.out.println("Fuseki is running on :8080/rdf");
    }
}
