package io.fairspace.saturn.vfs;

import com.pivovarit.function.ThrowingConsumer;
import io.fairspace.saturn.Context;

import java.io.*;
import java.util.concurrent.atomic.AtomicReference;

public class Pipe {
    public static void pipe(ThrowingConsumer<OutputStream, IOException> writer, ThrowingConsumer<InputStream, IOException> reader) throws IOException {
        try (var in = new PipedInputStream();
             var out = new PipedOutputStream(in)) {
            var err = new AtomicReference<IOException>();

            new Thread(new Context.ContextTask(() -> {
                try {
                    writer.accept(out);
                    out.close();
                } catch (IOException e) {
                    err.set(e);
                }
            })).start();

            reader.accept(in);

            if (err.get() != null) {
                throw err.get();
            }
        }
    }
}
