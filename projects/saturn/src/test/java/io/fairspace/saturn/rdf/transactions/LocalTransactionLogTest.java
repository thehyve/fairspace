package io.fairspace.saturn.rdf.transactions;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.File;
import java.io.IOException;

import static java.util.UUID.randomUUID;
import static org.apache.commons.io.FileUtils.deleteDirectory;
import static org.apache.commons.io.FileUtils.getTempDirectory;
import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
public class LocalTransactionLogTest {
    @Mock
    private TransactionCodec codec;

    private File logDir;
    private LocalTransactionLog log;


    @Before
    public void before() {
        logDir = new File(getTempDirectory(), randomUUID().toString());
        log = new LocalTransactionLog(logDir, codec);
    }

    @After
    public void after() throws IOException {
        deleteDirectory(logDir);
    }

    @Test
    public void logContinuesNumbering() throws IOException {
        log.log(new TransactionRecord());
        var newLog = new LocalTransactionLog(logDir, codec);
        newLog.log(new TransactionRecord());

        assertTrue(new File(new File(new File(logDir, "volume-1"), "chapter-1"), "tx-1").exists());
        assertTrue(new File(new File(new File(logDir, "volume-1"), "chapter-1"), "tx-2").exists());
    }

    @Test
    public void storageSchemaWorksAsExpected() throws IOException {
        for (int i = 0; i < 1000001; i++) {
            log.log(new TransactionRecord());
        }
        assertTrue(new File(new File(new File(logDir, "volume-2"), "chapter-1001"), "tx-1000001").exists());
    }
}