package io.fairspace.saturn.rdf.transactions;

import org.apache.jena.graph.Node;

import java.io.*;
import java.util.concurrent.atomic.AtomicLong;

import static java.nio.file.Files.move;
import static java.nio.file.StandardCopyOption.ATOMIC_MOVE;

/**
 * Stores transactions in the following directory structure:
 * volume-1
 * chapter-1
 * tx-1
 * ...
 * tx-1000
 * chapter-2
 * tx-1001
 * ...
 * tx-2000
 * ...
 * chapter-1000
 * tx-999001
 * ...
 * tx-1000000
 * volume-2
 * chapter-1001
 * tx-1000001
 * ...
 */
public class LocalTransactionLog implements TransactionLog {
    private static final int CHAPTERS_PER_VOLUME = 1000;
    private static final int RECORDS_PER_CHAPTER = 1000;
    private static final String VOLUME_PREFIX = "volume-";
    private static final String CHAPTER_PREFIX = "chapter-";
    private static final String RECORD_PREFIX = "tx-";

    private final File directory;
    private final TransactionCodec codec;
    private final AtomicLong counter = new AtomicLong();
    private File current;
    private OutputStream outputStream;
    private TransactionListener listener;


    public LocalTransactionLog(File directory, TransactionCodec codec) {
        this.directory = directory;
        this.codec = codec;

        directory.mkdirs();

        counter.set(numberOfFiles());
    }

    @Override
    public void onBegin(String commitMessage, String userId, String userName, long timestamp) throws IOException {
        current = new File(directory, "current");
        current.delete();

        outputStream = new BufferedOutputStream(new FileOutputStream(current));
        listener = codec.write(outputStream);
        listener.onBegin(commitMessage, userId, userName, timestamp);
    }

    @Override
    public void onAdd(Node graph, Node subject, Node predicate, Node object) throws IOException {
        listener.onAdd(graph, subject, predicate, object);
    }

    @Override
    public void onDelete(Node graph, Node subject, Node predicate, Node object) throws IOException {
        listener.onDelete(graph, subject, predicate, object);
    }

    @Override
    public void onCommit() throws IOException {
        listener.onCommit();
        outputStream.close();
        move(current.toPath(), file(counter.get()).toPath(), ATOMIC_MOVE);
        counter.incrementAndGet();
        listener = null;
        outputStream = null;
        current = null;
    }

    @Override
    public void onAbort() throws IOException {
        listener.onAbort();
        outputStream.close();
        current.delete();
        listener = null;
        outputStream = null;
        current = null;
    }

    @Override
    public long size() {
        return counter.get();
    }

    @Override
    public void read(long index, TransactionListener listener) throws IOException {
        try (var in = new BufferedInputStream(new FileInputStream(file(index)))) {
            codec.read(in, listener);
        }
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

    private File file(long transactionNumber) {
        var volumeNumber = transactionNumber / CHAPTERS_PER_VOLUME / RECORDS_PER_CHAPTER + 1;
        var volume = new File(directory, VOLUME_PREFIX + volumeNumber);
        var chapterNumber = transactionNumber / RECORDS_PER_CHAPTER + 1;
        var chapter = new File(volume, CHAPTER_PREFIX + chapterNumber);
        chapter.mkdirs();
        return new File(chapter, RECORD_PREFIX + (transactionNumber + 1));
    }
}
