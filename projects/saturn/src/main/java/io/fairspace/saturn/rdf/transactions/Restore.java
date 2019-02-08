package io.fairspace.saturn.rdf.transactions;

import lombok.extern.slf4j.Slf4j;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.update.UpdateExecutionFactory;

import java.io.IOException;

import static org.apache.jena.system.Txn.executeWrite;

@Slf4j
public class Restore {
    public static void restore(DatasetGraph dsg, LocalTransactionLog txnLog) {
        log.warn("Your metadata database is gone. Restoring from the transaction log.");

        var logSize = txnLog.size();

        for (long i = 0; i < logSize; i++) {
            if (i % 1000 == 0) {
                log.info("Restoring transaction {} of {}", i + 1, logSize);
            }
            try {
                var txn = txnLog.get(i);
                executeWrite(dsg, () -> UpdateExecutionFactory.create(txn.asUpdateRequest(), dsg).execute());
            } catch (IOException e) {
                log.error("Error applying transaction #" + (i + 1), e);
                throw new RuntimeException(e);
            }
        }

        log.warn("Restore is finished.");
    }
}
