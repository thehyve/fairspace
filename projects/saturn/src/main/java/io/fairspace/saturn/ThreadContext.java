package io.fairspace.saturn;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.function.Consumer;

import static java.lang.ThreadLocal.withInitial;

@NoArgsConstructor
@AllArgsConstructor
public class ThreadContext {
    private static final ThreadLocal<ThreadContext> threadContext = withInitial(ThreadContext::new);

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
    private OAuthAuthenticationToken userInfo;
    @Getter
    @Setter
    private String userCommitMessage;
    @Getter
    @Setter
    private String systemCommitMessage;
}