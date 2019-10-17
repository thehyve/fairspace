package io.fairspace.saturn;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import static java.lang.ThreadLocal.withInitial;

@NoArgsConstructor
@AllArgsConstructor
public class ThreadContext {
    private static final ThreadLocal<ThreadContext> threadContext = withInitial(ThreadContext::new);

    public static ThreadContext getThreadContext() {
        return threadContext.get();
    }

    public static void setThreadContext(ThreadContext context) {
        threadContext.set(context);
    }

    public static void cleanThreadContext() {
        threadContext.remove();
    }

    @Getter @Setter private OAuthAuthenticationToken userInfo;
    @Getter @Setter private String userCommitMessage;
    @Getter @Setter private String systemCommitMessage;
}
