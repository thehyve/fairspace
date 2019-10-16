package io.fairspace.saturn;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import lombok.Value;

@Value
public class Context {
    public static final ThreadLocal<Context> threadContext = new ThreadLocal<>();

    OAuthAuthenticationToken userInfo;
    String commitMessage;

}
