package io.fairspace.saturn.rdf.transactions;

import io.fairspace.saturn.rdf.*;
import io.fairspace.saturn.services.views.*;
import lombok.*;
import lombok.extern.slf4j.*;
import org.apache.jena.graph.Node;
import org.apache.jena.query.*;
import org.apache.jena.sparql.core.*;

import java.util.Date;
import java.util.*;
import java.util.stream.Collectors;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;

@Slf4j
public class TxnIndexDatasetGraph extends AbstractChangesAwareDatasetGraph {
    private final DatasetGraph dsg;
    private final ViewStoreClientFactory viewStoreClientFactory;
    // One set of updated subjects if write transactions are handled sequentially.
    // If many write transactions can be active simultaneously, this set needs to be
    // tied to the active thread.
    private final Set<Node> updatedSubjects = new HashSet<>();

    public TxnIndexDatasetGraph(DatasetGraph dsg, ViewStoreClientFactory viewStoreClientFactory) {
        super(dsg);
        this.dsg = dsg;
        this.viewStoreClientFactory = viewStoreClientFactory;
    }

    private void markSubject(Node subject) {
        updatedSubjects.add(subject);
    }

    /**
     * Collects changes
     */
    @Override
    protected void onChange(QuadAction action, Node graph, Node subject, Node predicate, Node object) {
        switch (action) {
            case ADD, DELETE -> markSubject(subject);
        }
    }

    @Override
    public void begin(TxnType type) {
        begin(TxnType.convert(type));
        if (isInWriteTransaction()) {
            updatedSubjects.clear();
        }
    }

    @SneakyThrows
    @Override
    public void commit() {
        if (isInWriteTransaction()) {
            if (updatedSubjects.stream().anyMatch(r -> r.isURI() && r.getURI().startsWith(CONFIG.publicUrl + "/api/extra-storage"))) {
                updatedSubjects.clear();
            } else {
                log.debug("Commit updated subjects: {}", updatedSubjects);
                var start = new Date().getTime();
                try (var viewStoreClient = viewStoreClientFactory.build();
                     var viewUpdater = new ViewUpdater(viewStoreClient, dsg)) {
                    updatedSubjects.forEach(viewUpdater::updateSubject);
                    viewUpdater.commit();
                    log.debug("Updating {} subjects took {}ms", updatedSubjects.size(), new Date().getTime() - start);
                } catch (Exception e) {
                    log.error("Updating {} subjects failed after {}ms", updatedSubjects.size(), new Date().getTime() - start, e);
                    throw e;
                } finally {
                    updatedSubjects.clear();
                }
            }
        }
        super.commit();
    }

    @Override
    public void abort() {
        super.abort();
        if (isInWriteTransaction()) {
            log.debug("Aborting transaction");
            updatedSubjects.clear();
        }
    }

    private boolean isInWriteTransaction() {
        return transactionMode() == ReadWrite.WRITE;
    }
}
