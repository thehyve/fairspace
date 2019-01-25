package io.fairspace.saturn;

import io.fairspace.saturn.rdf.Vocabulary;
import io.fairspace.saturn.rdf.inversion.InvertingDatasetGraph;
import io.fairspace.saturn.rdf.transactions.LocalTransactionLog;
import io.fairspace.saturn.rdf.transactions.SimpleTransactionSerializer;
import io.fairspace.saturn.rdf.transactions.TransactionLog;
import io.fairspace.saturn.rdf.transactions.TxnLogDatasetGraph;
import io.fairspace.saturn.services.metadata.MetadataAPIServlet;
import io.fairspace.saturn.services.vocabulary.VocabularyAPIServlet;
import org.apache.jena.fuseki.main.FusekiServer;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.sparql.core.DatasetGraph;
import org.cfg4j.provider.ConfigurationProviderBuilder;
import org.cfg4j.source.classpath.ClasspathConfigurationSource;
import org.cfg4j.source.compose.FallbackConfigurationSource;
import org.cfg4j.source.files.FilesConfigurationSource;
;

import java.io.File;
import java.nio.file.Paths;

import static java.util.Collections.singletonList;
import static org.apache.jena.tdb2.DatabaseMgr.connectDatasetGraph;

public class App {
    private static Config CONFIG = new ConfigurationProviderBuilder()
            .withConfigurationSource(new FallbackConfigurationSource(
                    new ClasspathConfigurationSource(() -> singletonList(Paths.get("./application.yaml"))),
                    new FilesConfigurationSource(() -> singletonList(Paths.get("./application.yaml")))))
            .build()
            .bind("saturn", Config.class);

    public static void main(String[] args) {
        System.out.println("Saturn is starting");

        TransactionLog txnLog = new LocalTransactionLog(new File(CONFIG.transactionLogPath()), new SimpleTransactionSerializer());
        DatasetGraph dsg = new InvertingDatasetGraph(new TxnLogDatasetGraph(connectDatasetGraph(CONFIG.datasetPath()), txnLog));
        Vocabulary.init(dsg);
        Dataset ds = DatasetFactory.wrap(dsg);

        RDFConnection connection = new RDFConnectionLocal(ds);

        FusekiServer.create()
                .add("/rdf", ds)
                .addServlet("/statements", new MetadataAPIServlet(connection))
                .addServlet("/vocabulary", new VocabularyAPIServlet(connection))
                .port(CONFIG.port())
                .build()
                .start();

        System.out.println("Saturn is running on port " + CONFIG.port());
        System.out.println("Access Fuseki at /rdf");
        System.out.println("Access Metadata at /statements");
        System.out.println("Access Vocabulary API at /vocabulary");
    }
}
