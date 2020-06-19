package io.fairspace.saturn.audit;

import org.slf4j.Logger;
import org.slf4j.MDC;

import java.util.Objects;

import static io.fairspace.saturn.auth.RequestContext.getCurrentUser;


public class Audit {
    private static final Logger log = org.slf4j.LoggerFactory.getLogger("AUDIT");

    public static void audit(String event, Object... params) {
        MDC.put("event", event);

        for (var i = 0; i < params.length / 2; i++) {
            if (params[2 * i + 1] != null) {
                MDC.put((String) params[2 * i], Objects.toString(params[2 * i + 1]));
            }
        }

        var user = getCurrentUser();

        if (user != null) {
            if (user.getName() != null) {
                MDC.put("user_name", user.getName());
            }
            if (user.getEmail() != null) {
                MDC.put("user_email", user.getEmail());
            }
            MDC.put("user_iri", user.getIri().getURI());
        }

        log.info(event);

        MDC.clear();
    }
}
