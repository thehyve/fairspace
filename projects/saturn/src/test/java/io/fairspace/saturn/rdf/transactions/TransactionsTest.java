package io.fairspace.saturn.rdf.transactions;


import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import org.apache.jena.dboe.transaction.txn.TransactionException;
import org.apache.jena.query.Dataset;
import org.apache.jena.shared.LockMRSW;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.IOException;

import static java.util.UUID.randomUUID;
import static junit.framework.TestCase.assertTrue;
import static org.apache.commons.io.FileUtils.deleteDirectory;
import static org.apache.commons.io.FileUtils.getTempDirectory;
import static org.apache.jena.query.ReadWrite.WRITE;

public class TransactionsTest {
    private Config.Jena config = new Config.Jena();
    private Dataset ds;
    private Transactions txn;


    @Before
    public void before() throws IOException {
        config.elasticSearch.enabled = false;
        config.datasetPath = new File(getTempDirectory(), randomUUID().toString());
        config.transactionLogPath = new File(getTempDirectory(), randomUUID().toString());

        ds = SaturnDatasetFactory.connect(config);
        txn = new BulkTransactions(ds);
    }

    @After
    public void after() throws IOException {
        ds.close();
        deleteDirectory(config.datasetPath);
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

}
