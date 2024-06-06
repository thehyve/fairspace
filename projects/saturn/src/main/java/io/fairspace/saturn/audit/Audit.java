package io.fairspace.saturn.audit;

import java.util.Objects;

import org.apache.logging.log4j.*;
import org.apache.logging.log4j.Logger;

import static io.fairspace.saturn.auth.RequestContext.getAccessToken;

public class Audit {
    private static final Logger log = LogManager.getLogger("audit");

    public static void audit(String event, Object... params) {
        ThreadContext.put("event", event);

        for (var i = 0; i < params.length / 2; i++) {
            if (params[2 * i + 1] != null) {
                ThreadContext.put((String) params[2 * i], Objects.toString(params[2 * i + 1]));
            }
        }

        var token = getAccessToken();

        if (token.getPreferredUsername() != null) {
            ThreadContext.put("user_name", token.getPreferredUsername());
        }

        if (token.getEmail() != null) {
            ThreadContext.put("user_email", token.getEmail());
        }
        ThreadContext.put("user_id", token.getSubject());

        log.trace(event);

        ThreadContext.clearAll();
    }
}
