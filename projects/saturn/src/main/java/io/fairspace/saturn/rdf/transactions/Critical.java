package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingRunnable;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Critical {
    private static final String ERROR_MSG =
            "Catastrophic failure. Shutting down. The system requires admin's intervention.";

    static void critical(ThrowingRunnable<Exception> action) {
        try {
            action.run();
        } catch (Throwable t) {
            log.error(ERROR_MSG, t);


            // SLF4J has no flush method.
            System.err.println(ERROR_MSG);
            t.printStackTrace();

            System.err.flush();

            log.error(ERROR_MSG, t);
            // There's no log.flush() :-(

            System.exit(1);
        }
    }
}
