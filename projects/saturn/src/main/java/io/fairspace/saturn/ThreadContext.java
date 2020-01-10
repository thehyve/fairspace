package io.fairspace.saturn;

import io.fairspace.saturn.services.users.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.function.Consumer;


@NoArgsConstructor
@AllArgsConstructor
public class ThreadContext {
    private static final ThreadLocal<ThreadContext> threadContext = new ThreadLocal<>();

    private static final ThreadLocal<Consumer<? super ThreadContext>> threadContextListener = new ThreadLocal<>();

    public static ThreadContext getThreadContext() {
        return threadContext.get();
    }

    public static void setThreadContext(ThreadContext context) {
        threadContext.set(context);
        if (context != null) {
            var listener = threadContextListener.get();
            if (listener != null) {
                listener.accept(context);
            }
        }
    }

    public static void cleanThreadContext() {
        threadContext.remove();
    }

    public static void setThreadContextListener(Consumer<? super ThreadContext> listener) {
        threadContextListener.set(listener);
        if (listener != null) {
            var ctx = threadContext.get();
            if (ctx != null) {
                listener.accept(ctx);
            }
        }
    }

    @Getter
    @Setter
    private User user;
    @Getter
    @Setter
    private String userCommitMessage;
    @Getter
    @Setter
    private String systemCommitMessage;
    @Getter
    @Setter
    private String project;
}