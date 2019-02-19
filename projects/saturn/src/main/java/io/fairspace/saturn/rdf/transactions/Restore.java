package io.fairspace.saturn.rdf.transactions;

import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.DatasetGraph;

import static org.apache.jena.system.Txn.executeWrite;

@Slf4j
public class Restore {
    public static void restore(DatasetGraph dsg, LocalTransactionLog txnLog) {
        var logSize = txnLog.size();

        if (logSize == 0) {
            return;
        }

        log.warn("Your metadata database is gone. Restoring from the transaction log containing {} transactions", logSize);

        executeWrite(dsg, () -> {
            var prevProgress = -1L;
            for (var i = 0; i < logSize; i++) {
                var progress = (100 * i) / logSize;
                if (progress > prevProgress) {
                    log.info("Progress: {}%", progress);
                    prevProgress = progress;
                }
                try {
                    txnLog.read(i, new TransactionListener() {
                        @Override
                        public void onAdd(Node graph, Node subject, Node predicate, Node object) {
                            dsg.add(graph, subject, predicate, object);
                        }

                        @Override
                        public void onDelete(Node graph, Node subject, Node predicate, Node object) {
                            dsg.delete(graph, subject, predicate, object);
                        }
                    });
                } catch (Exception e) {
                    log.error("Error applying transaction #" + (i + 1), e);
                    throw e;
                }
            }
            log.info("Progress: 100%");
            log.info("Committing changes");
        });

        log.warn("Restore is finished.");
    }
}
