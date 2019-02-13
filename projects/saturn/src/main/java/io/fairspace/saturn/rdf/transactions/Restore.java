package io.fairspace.saturn.rdf.transactions;

import lombok.extern.slf4j.Slf4j;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.update.UpdateExecutionFactory;

import java.io.IOException;

import static org.apache.jena.system.Txn.executeWrite;

@Slf4j
public class Restore {
    public static void restore(DatasetGraph dsg, LocalTransactionLog txnLog) {
        executeWrite(dsg, () -> {
            var logSize = txnLog.size();
            log.warn("Your metadata database is gone. Restoring from the transaction log containing {} transactions", logSize);
            var prevProgress = -1L;
            for (var i = 0; i < logSize; i++) {
                var progress = (100 * i) / logSize;
                if (progress > prevProgress) {
                    log.info("Progress: {}%", progress);
                    prevProgress = progress;
                }
                try {
                    var txn = txnLog.get(i);
                    UpdateExecutionFactory.create(txn.asUpdateRequest(), dsg).execute();
                } catch (IOException e) {
                    log.error("Error applying transaction #" + (i + 1), e);
                    throw new RuntimeException(e);
                }
            }
            log.info("Progress: 100%");
            log.info("Committing changes");
        });

        log.warn("Restore is finished.");
    }
}
