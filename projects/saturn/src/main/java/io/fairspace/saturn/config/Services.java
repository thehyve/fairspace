package io.fairspace.saturn.config;

import io.fairspace.saturn.rdf.search.FilteredDatasetGraph;
import io.fairspace.saturn.rdf.transactions.BulkTransactions;
import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.mail.MailService;
import io.fairspace.saturn.services.metadata.ChangeableMetadataService;
import io.fairspace.saturn.services.metadata.MetadataEntityLifeCycleManager;
import io.fairspace.saturn.services.metadata.MetadataPermissions;
import io.fairspace.saturn.services.metadata.ReadableMetadataService;
import io.fairspace.saturn.services.metadata.validation.*;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.services.workspaces.WorkspaceService;
import io.fairspace.saturn.webdav.BlobStore;
import io.fairspace.saturn.webdav.DavFactory;
import io.fairspace.saturn.webdav.LocalBlobStore;
import io.fairspace.saturn.webdav.WebDAVServlet;
import lombok.Getter;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.Dataset;
import org.apache.jena.sparql.util.Symbol;

import javax.servlet.http.HttpServlet;
import java.io.File;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.vocabulary.Vocabularies.META_VOCABULARY_GRAPH_URI;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;

@Slf4j
@Getter
public class Services {
    public static final Symbol FS_ROOT = Symbol.create("file_system_root");

    private final Config config;
    private final Transactions transactions;

    private final WorkspaceService workspaceService;
    private final UserService userService;
    private final MailService mailService;
    private final MetadataPermissions metadataPermissions;
    private final ChangeableMetadataService metadataService;
    private final ChangeableMetadataService userVocabularyService;
    private final ReadableMetadataService metaVocabularyService;
    private final BlobStore blobStore;
    private final DavFactory davFactory;
    private final HttpServlet davServlet;
    private final FilteredDatasetGraph filteredDatasetGraph;


    public Services(@NonNull Config config, @NonNull Dataset dataset) {
        this.config = config;
        this.transactions = config.jena.bulkTransactions ? new BulkTransactions(dataset) : new SimpleTransactions(dataset);

        userService = new UserService(config.auth, transactions);

        mailService = new MailService(config.mail);
        blobStore = new LocalBlobStore(new File(config.webDAV.blobStorePath));
        davFactory = new DavFactory(dataset.getDefaultModel().createResource(CONFIG.publicUrl + "/api/v1/webdav"), blobStore, mailService);
        dataset.getContext().set(FS_ROOT, davFactory.root);
        davServlet = new WebDAVServlet(davFactory, transactions, blobStore);

        workspaceService = new WorkspaceService(transactions, mailService);

        metadataPermissions = new MetadataPermissions(workspaceService, davFactory);

        var metadataLifeCycleManager = new MetadataEntityLifeCycleManager(dataset, defaultGraphIRI, VOCABULARY_GRAPH_URI);

        var metadataValidator = new ComposedValidator(
                new MachineOnlyClassesValidator(),
                new ProtectMachineOnlyPredicatesValidator(),
                new PermissionCheckingValidator(metadataPermissions),
                new DeletionValidator(),
                new ShaclValidator());

        metadataService = new ChangeableMetadataService(transactions, defaultGraphIRI, VOCABULARY_GRAPH_URI, metadataLifeCycleManager, metadataValidator);

        var vocabularyValidator = new ComposedValidator(
                new ProtectMachineOnlyPredicatesValidator(),
                new DeletionValidator(),
                new ShaclValidator(),
                new SystemVocabularyProtectingValidator(),
                new MetadataAndVocabularyConsistencyValidator(dataset),
                new InverseForUsedPropertiesValidator(dataset)
        );

        var vocabularyLifeCycleManager = new MetadataEntityLifeCycleManager(dataset, VOCABULARY_GRAPH_URI, META_VOCABULARY_GRAPH_URI);

        userVocabularyService = new ChangeableMetadataService(transactions, VOCABULARY_GRAPH_URI, META_VOCABULARY_GRAPH_URI, vocabularyLifeCycleManager, vocabularyValidator);
        metaVocabularyService = new ReadableMetadataService(transactions, META_VOCABULARY_GRAPH_URI, META_VOCABULARY_GRAPH_URI);

        filteredDatasetGraph = new FilteredDatasetGraph(dataset.asDatasetGraph(), metadataPermissions);
    }
}
