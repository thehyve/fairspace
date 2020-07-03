package io.fairspace.saturn.audit;

import org.slf4j.Logger;
import org.slf4j.MDC;

import java.util.Objects;

import static io.fairspace.saturn.auth.RequestContext.getAccessToken;


public class Audit {
    private static final Logger log = org.slf4j.LoggerFactory.getLogger("AUDIT");

    public static void audit(String event, Object... params) {
        MDC.put("event", event);

        for (var i = 0; i < params.length / 2; i++) {
            if (params[2 * i + 1] != null) {
                MDC.put((String) params[2 * i], Objects.toString(params[2 * i + 1]));
            }
        }

        var token = getAccessToken();

        if (token.getName() != null) {
            MDC.put("user_name", token.getName());
        }

        if (token.getEmail() != null) {
            MDC.put("user_email", token.getEmail());
        }
        MDC.put("user_id", token.getSubject());


        log.info(event);

        MDC.clear();
    }
}
