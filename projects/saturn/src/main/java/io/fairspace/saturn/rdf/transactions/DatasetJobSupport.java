package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingRunnable;
import com.pivovarit.function.ThrowingSupplier;
import org.apache.jena.query.Dataset;
import org.apache.jena.system.Txn;

import static io.fairspace.saturn.ThreadContext.getThreadContext;

public interface DatasetJobSupport extends Dataset, JobSupport {
    default <T, E extends Exception> T calculateWrite(String systemCommitMessage, ThrowingSupplier<T, E> job) throws E {
        var ctx = getThreadContext();
        if (ctx != null) {
            ctx.setSystemCommitMessage(systemCommitMessage);
        }
        return calculateWrite(job);
    }


    default  <E extends Exception> void executeWrite(String systemCommitMessage,  ThrowingRunnable<E> job) throws E {
        calculateWrite(systemCommitMessage, () -> {
            job.run();
            return null;
        });
    }

    default <E extends Exception> void executeWrite(ThrowingRunnable<E> job) throws E {
        calculateWrite(() -> {
            job.run();
            return null;
        });
    }

    default <X, E extends Exception> X calculateRead(ThrowingSupplier<X, E> r) throws E {
        return Txn.calculateRead(this, ThrowingSupplier.sneaky(r));
    }

    default  <E extends Exception> void executeRead(ThrowingRunnable<E> r) throws E {
        Txn.executeRead(this, ThrowingRunnable.sneaky(r));
    }
}
