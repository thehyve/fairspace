package io.fairspace.saturn;

import io.fairspace.saturn.services.users.User;

import java.util.function.Consumer;


public class ThreadContext {
    private static final ThreadLocal<ThreadContext> threadContext = new ThreadLocal<>();

    private static final ThreadLocal<Consumer<? super ThreadContext>> threadContextListener = new ThreadLocal<>();

    public ThreadContext(User user) {
        this.user = user;
    }

    public ThreadContext() {
    }

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

    private User user;

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

}