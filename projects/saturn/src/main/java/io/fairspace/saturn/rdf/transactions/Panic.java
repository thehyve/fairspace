package io.fairspace.saturn.rdf.transactions;

import lombok.extern.slf4j.Slf4j;

@Slf4j
class Panic {
    private static final String ERROR_MSG =
            "Catastrophic failure. Shutting down. The system requires admin's intervention.";


    static void panic(Throwable reason, boolean persistedToLog) {
        log.error(ERROR_MSG, reason);
        var statusMsg = persistedToLog
                ? "The failed transaction has been persisted to the transaction log"
                : "The failed transaction has NOT been persisted to the transaction log";

        log.error(statusMsg);


        // SLF4J has no flush method.
        System.err.println(ERROR_MSG);
        reason.printStackTrace();
        System.err.println(statusMsg);

        System.err.flush();

        log.error(ERROR_MSG, reason);
        log.error(statusMsg);
        // There's no log.flush() :-(

        System.exit(1);
    }
}
