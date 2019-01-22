package io.fairspace.saturn;

import io.fairspace.saturn.rdf.DatasetFactory;
import org.apache.jena.fuseki.main.FusekiServer;
import org.cfg4j.provider.ConfigurationProviderBuilder;
import org.cfg4j.source.classpath.ClasspathConfigurationSource;
import org.cfg4j.source.compose.FallbackConfigurationSource;
import org.cfg4j.source.files.FilesConfigurationSource;

import java.nio.file.Paths;

import static java.util.Collections.singletonList;

public class App {
    public static final Config CONFIG = new ConfigurationProviderBuilder()
            .withConfigurationSource(new FallbackConfigurationSource(
                    new ClasspathConfigurationSource(() -> singletonList(Paths.get("./application.yaml"))),
                    new FilesConfigurationSource(() -> singletonList(Paths.get("./application.yaml")))))
            .build()
            .bind("saturn", Config.class);

    public static void main(String[] args) {
        FusekiServer.create()
                .add("/rdf", DatasetFactory.connectDataset())
                .port(8080)
                .build()
                .start();

        System.out.println("Fuseki is running on :8080/rdf");
    }
}
