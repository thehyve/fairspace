package io.fairspace.saturn.commits;


import com.pivovarit.function.ThrowingRunnable;
import com.pivovarit.function.ThrowingSupplier;
import io.fairspace.saturn.Context;

import static io.fairspace.saturn.Context.threadContext;
import static java.util.Optional.ofNullable;

/**
 * Manages commit messages.
 * A commit message can be set either externally using Saturn-Commit-Message header of the incoming HTTP request
 * or by calling withCommitMessage.
 */
public class CommitMessages {

    public static <E extends Exception> void withCommitMessage(String message, ThrowingRunnable<E> action) throws E {
        var ctx = threadContext.get();
        threadContext.set(new Context(ofNullable(ctx).map(Context::getUserInfo).orElse(null), message));

        action.run();
    }

    public static <T, E extends Exception> T withCommitMessage(String message, ThrowingSupplier<T, E> action) throws E {
        var ctx = threadContext.get();
        threadContext.set(new Context(ofNullable(ctx).map(Context::getUserInfo).orElse(null), message));

        return action.get();
    }
}
