package io.fairspace.saturn.rdf.transactions;

import java.io.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Stores transactions in the following directory structure:
 * volume-1
 *   chapter-1
 *     tx-1
 *     ...
 *     tx-1000
 *   chapter-2
 *     tx-1001
 *     ...
 *     tx-2000
 *   ...
 *   chapter-1000
 *     tx-999001
 *     ...
 *     tx-1000000
 * volume-2
 *   chapter-1001
 *     tx-1000001
 * ...
 */
public class LocalTransactionLog implements TransactionLog {
    private static final int CHAPTERS_PER_VOLUME = 1000;
    private static final int RECORDS_PER_CHAPTER = 1000;
    private static final String VOLUME_PREFIX = "volume-";
    private static final String CHAPTER_PREFIX = "chapter-";
    private static final String RECORD_PREFIX = "tx-";

    private final File directory;
    private final TransactionSerializer serializer;
    private final AtomicLong counter = new AtomicLong();

    public LocalTransactionLog(File directory, TransactionSerializer serializer) {
        this.directory = directory;
        this.serializer = serializer;

        directory.mkdirs();

        counter.set(numberOfFiles());
    }

    private int numberOfFiles() {
        var volumeCount = childCount(directory, VOLUME_PREFIX);
        if (volumeCount == 0) {
            return 0;
        }
        var lastVolume = new File(directory, VOLUME_PREFIX + volumeCount);
        var chapterCount = childCount(lastVolume, CHAPTER_PREFIX);
        if (chapterCount == 0) {
            throw new IllegalStateException("Transaction log is broken");
        }
        var chapterNumber = (volumeCount - 1) * CHAPTERS_PER_VOLUME + chapterCount;
        var lastChapter = new File(lastVolume, CHAPTER_PREFIX + chapterNumber);
        var recordsInChapter = childCount(lastChapter, RECORD_PREFIX);
        if (recordsInChapter == 0) {
            throw new IllegalStateException("Transaction log is broken");
        }
        return (volumeCount - 1) * CHAPTERS_PER_VOLUME + (chapterCount - 1) * RECORDS_PER_CHAPTER + recordsInChapter;
    }

    private static int childCount(File parent, String prefix) {
        var files = parent.list((dir, name) -> name.startsWith(prefix));
        return files == null ? 0 : files.length;
    }

    @Override
    public void log(TransactionRecord transaction) throws IOException {
        var transactionNumber = counter.getAndIncrement();
        var volumeNumber = transactionNumber / CHAPTERS_PER_VOLUME / RECORDS_PER_CHAPTER + 1;
        var volume = new File(directory, VOLUME_PREFIX + volumeNumber);
        var chapterNumber = transactionNumber / RECORDS_PER_CHAPTER + 1;
        var chapter = new File(volume, CHAPTER_PREFIX + chapterNumber);
        chapter.mkdirs();
        var record = new File(chapter, RECORD_PREFIX + (transactionNumber + 1));
        try (var out = new BufferedOutputStream(new FileOutputStream(record))) {
            serializer.write(transaction, out);
        }
    }
}
