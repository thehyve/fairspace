package io.fairspace.saturn.rdf.transactions;

import org.apache.jena.graph.Node;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.modify.request.QuadDataAcc;
import org.apache.jena.sparql.modify.request.UpdateDataDelete;
import org.apache.jena.sparql.modify.request.UpdateDataInsert;
import org.apache.jena.update.Update;
import org.apache.jena.update.UpdateFactory;

import java.io.*;
import java.util.concurrent.atomic.AtomicLong;

import static java.lang.Long.parseLong;
import static java.nio.file.Files.move;
import static java.nio.file.StandardCopyOption.ATOMIC_MOVE;
import static java.util.Collections.singletonList;

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

    private static final String TIMESTAMP_PREFIX = "# Timestamp: ";
    private static final String USER_NAME_PREFIX = "# User Name: ";
    private static final String USER_ID_PREFIX = "# User ID: ";
    private static final String COMMIT_MESSAGE_PREFIX = "# Commit Message: ";

    private final File directory;
    private final AtomicLong counter = new AtomicLong();
    private File current;
    private OutputStreamWriter writer;

    public LocalTransactionLog(File directory) {
        this.directory = directory;

        directory.mkdirs();

        counter.set(numberOfFiles());
    }

    @Override
    public long size() {
        return counter.get();
    }

    @Override
    public void read(long index, TransactionListener listener) {
        long timestamp = 0L;
        String userName = null;
        String userId = null;
        String commitMessage = null;

        try (var reader = new BufferedReader(new InputStreamReader(new FileInputStream(file(index))))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith(TIMESTAMP_PREFIX)) {
                    timestamp = parseLong(line.substring(TIMESTAMP_PREFIX.length()));
                } else if (line.startsWith(USER_NAME_PREFIX)) {
                    userName = line.substring(USER_NAME_PREFIX.length());
                } else if (line.startsWith(USER_ID_PREFIX)) {
                    userId = line.substring(USER_ID_PREFIX.length());
                } else if (line.startsWith(COMMIT_MESSAGE_PREFIX)) {
                    commitMessage = line.substring(COMMIT_MESSAGE_PREFIX.length());
                } else if (line.isBlank()) {
                    listener.onBegin(commitMessage, userId, userName, timestamp);
                } else if (!line.startsWith("#")) {
                    UpdateFactory.create(line).forEach(update -> {
                        if (update instanceof UpdateDataDelete) {
                            ((UpdateDataDelete) update).getQuads().forEach(quad ->
                                    listener.onDelete(quad.getGraph(), quad.getSubject(), quad.getPredicate(), quad.getObject()));
                        } else if (update instanceof UpdateDataInsert) {
                            ((UpdateDataInsert) update).getQuads().forEach(quad ->
                                    listener.onAdd(quad.getGraph(), quad.getSubject(), quad.getPredicate(), quad.getObject()));
                        }
                    });
                }
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
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

    @Override
    public void onBegin(String commitMessage, String userId, String userName, long timestamp) {
        current = new File(directory, "current");
        current.delete();
        try {
            writer = new OutputStreamWriter(new BufferedOutputStream(new FileOutputStream(current)));
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void onAdd(Node graph, Node subject, Node predicate, Node object) {
        save(new UpdateDataInsert(toQuads(graph, subject, predicate, object)));
    }

    @Override
    public void onDelete(Node graph, Node subject, Node predicate, Node object) {
        save(new UpdateDataDelete(toQuads(graph, subject, predicate, object)));
    }

    private void save(Update update) {
        try {
            writer.append(update.toString().replace('\n', ' ')).append(";\n");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private static QuadDataAcc toQuads(Node graph, Node subject, Node predicate, Node object) {
        return new QuadDataAcc(singletonList(new Quad(graph, subject, predicate, object)));
    }

    @Override
    public void onCommit() {
        try {
            writer.close();
            move(current.toPath(), file(counter.get()).toPath(), ATOMIC_MOVE);
            counter.incrementAndGet();
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            writer = null;
            current = null;
        }
    }

    @Override
    public void onAbort() {
        try {
            writer.close();
            current.delete();
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            writer = null;
            current = null;
        }
    }
}
