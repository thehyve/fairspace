package io.fairspace.saturn.audit;

import org.slf4j.Logger;
import org.slf4j.MDC;

import static io.fairspace.saturn.ThreadContext.getThreadContext;

public class Audit {
    private static final Logger log = org.slf4j.LoggerFactory.getLogger("AUDIT");

    public static void audit(String event, String... params) {
        var ctx = getThreadContext();
        MDC.put("event", event);
        MDC.put("project", ctx.getProject());

        for (var i = 0; i < params.length / 2; i++) {
            if (params[2 * i + 1] != null) {
                MDC.put(params[2 * i], params[2 * i + 1]);
            }
        }

        if (ctx.getUser().getName() != null) {
            MDC.put("user_name", ctx.getUser().getName());
        }
        if (ctx.getUser().getEmail() != null) {
            MDC.put("user_email", ctx.getUser().getEmail());
        }
        MDC.put("user_iri", ctx.getUser().getIri().getURI());

        log.info(event);

        MDC.clear();
    }
}
