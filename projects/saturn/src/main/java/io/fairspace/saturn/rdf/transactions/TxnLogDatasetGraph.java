package io.fairspace.saturn.rdf.transactions;

import io.fairspace.saturn.rdf.AbstractChangesAwareDatasetGraph;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.QuadAction;

import static io.fairspace.saturn.rdf.transactions.Critical.critical;

@Slf4j
public class TxnLogDatasetGraph extends AbstractChangesAwareDatasetGraph {
    private final TransactionLog transactionLog;


    public TxnLogDatasetGraph(DatasetGraph dsg, TransactionLog transactionLog) {
        super(dsg);
        this.transactionLog = transactionLog;
    }

    /**
     * Collects changes
     */
    @Override
    protected void onChange(QuadAction action, Node graph, Node subject, Node predicate, Node object) {
        critical(() -> {
            switch (action) {
                case ADD:
                    transactionLog.onAdd(graph, subject, predicate, object);
                    break;
                case DELETE:
                    transactionLog.onDelete(graph, subject, predicate, object);
                    break;
            }
        });
    }
}
