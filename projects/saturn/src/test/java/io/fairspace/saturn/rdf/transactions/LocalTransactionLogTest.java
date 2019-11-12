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
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.when;


@RunWith(MockitoJUnitRunner.class)
public class LocalTransactionLogTest {
    private File logDir;
    private LocalTransactionLog log;

    @Mock
    TransactionListener listener;

    @Mock
    private TransactionCodec codec;


    @Before
    public void before() throws IOException {
        when(codec.write(any())).thenReturn(listener);
        logDir = new File(getTempDirectory(), randomUUID().toString());
        log = new LocalTransactionLog(logDir, codec);
    }

    @After
    public void after() throws IOException {
        deleteDirectory(logDir);
    }

    @Test
    public void logContinuesNumbering() throws IOException {
        log.onBegin();
        log.onMetadata(null, null, null, null, 0);
        log.onCommit();
        var newLog = new LocalTransactionLog(logDir, codec);
        newLog.onBegin();
        newLog.onMetadata(null, null, null, null, 1);
        newLog.onCommit();

        assertEquals(2L, newLog.size());
        assertTrue(new File(new File(new File(logDir, "volume-1"), "chapter-1"), "tx-1").exists());
        assertTrue(new File(new File(new File(logDir, "volume-1"), "chapter-1"), "tx-2").exists());
    }

    @Test
    public void storageSchemaWorksAsExpected() throws IOException {
        for (int i = 0; i < 1001; i++) {
            log.onBegin();
            log.onMetadata(null, null,null, null, 0);
            log.onCommit();
        }
        assertEquals(1001L, log.size());
        assertTrue(new File(new File(new File(logDir, "volume-1"), "chapter-2"), "tx-1001").exists());
    }

    @Test
    public void doesNotLogAbortedTransactions() throws IOException {
        log.onBegin();
        log.onMetadata(null, null,null, null, 0);
        log.onAbort();

        assertEquals(0L, log.size());
        assertFalse(new File(new File(new File(logDir, "volume-1"), "chapter-1"), "tx-1").exists());

    }
}