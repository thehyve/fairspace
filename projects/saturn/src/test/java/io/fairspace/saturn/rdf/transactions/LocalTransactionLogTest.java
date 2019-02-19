package io.fairspace.saturn.rdf.transactions;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.IOException;

import static java.util.UUID.randomUUID;
import static org.apache.commons.io.FileUtils.deleteDirectory;
import static org.apache.commons.io.FileUtils.getTempDirectory;
import static org.junit.Assert.assertTrue;

public class LocalTransactionLogTest {
    private File logDir;
    private LocalTransactionLog log;


    @Before
    public void before() {
        logDir = new File(getTempDirectory(), randomUUID().toString());
        log = new LocalTransactionLog(logDir);
    }

    @After
    public void after() throws IOException {
        deleteDirectory(logDir);
    }

    @Test
    public void logContinuesNumbering() throws IOException {
        log.onBegin(null, null, null, 0);
        log.onCommit();
        var newLog = new LocalTransactionLog(logDir);
        newLog.onBegin(null, null, null, 1);
        newLog.onCommit();

        assertTrue(new File(new File(new File(logDir, "volume-1"), "chapter-1"), "tx-1").exists());
        assertTrue(new File(new File(new File(logDir, "volume-1"), "chapter-1"), "tx-2").exists());
    }

    @Test
    public void storageSchemaWorksAsExpected() throws IOException {
        for (int i = 0; i < 1001; i++) {
            log.onBegin(null, null, null, 0);
            log.onCommit();
        }
        assertTrue(new File(new File(new File(logDir, "volume-1"), "chapter-2"), "tx-1001").exists());
    }
}