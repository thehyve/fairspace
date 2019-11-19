package io.fairspace.saturn.rdf.transactions;

import org.apache.jena.dboe.transaction.txn.TransactionException;
import org.apache.jena.query.Dataset;
import org.apache.jena.shared.LockMRSW;
import org.apache.jena.sparql.JenaTransactionException;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.File;
import java.io.IOException;

import static java.util.UUID.randomUUID;
import static junit.framework.TestCase.assertTrue;
import static org.apache.commons.io.FileUtils.deleteDirectory;
import static org.apache.commons.io.FileUtils.getTempDirectory;
import static org.apache.jena.query.ReadWrite.WRITE;
import static org.apache.jena.system.Txn.executeRead;
import static org.apache.jena.system.Txn.executeWrite;
import static org.apache.jena.tdb2.TDB2Factory.connectDataset;

public class TransactionsTest {
    private static File dsDir;
    private static Dataset ds;


    @BeforeClass
    public static void before() {
        dsDir = new File(getTempDirectory(), randomUUID().toString());
        ds = connectDataset(dsDir.getAbsolutePath());
    }

    @AfterClass
    public static void after() throws IOException {
        ds.close();
        deleteDirectory(dsDir);
        ds = null;
    }

    @Test
    public void usesMRSWLock() {
        assertTrue(ds.getLock() instanceof LockMRSW);
    }

    @Test
    public void onlyOneWriteTransactionAtATime() throws InterruptedException {
        ds.begin(WRITE);
        var anotherThread = new Thread(() -> {
            ds.begin(WRITE);
            ds.commit();
        });
        anotherThread.start();
        anotherThread.join(1_000);
        assertTrue("The other thread should be still waiting on ds.begin(WRITE)", anotherThread.isAlive());
        ds.commit();
        // Now the other thread can start a transaction
        anotherThread.join();
    }

    @Test(expected = TransactionException.class)
    public void noNestedTransactions() {
        ds.begin(WRITE);
        try {
            ds.begin(WRITE);
        } finally {
            ds.commit();
        }
    }

    @Test(expected = TransactionException.class)
    public void noMultipleCommits() {
        ds.begin(WRITE);
        ds.commit();
        ds.commit();
    }

    @Test(expected = JenaTransactionException.class)
    public void readToWritePromotionIsNotPossible() {
        executeRead(ds, () -> executeWrite(ds, () -> {}));
    }

    @Test
    public void writeToReadDemotionIsPossible() {
        executeWrite(ds, () -> executeRead(ds, () -> {}));
    }
}
