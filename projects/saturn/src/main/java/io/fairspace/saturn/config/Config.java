package io.fairspace.saturn.config;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class Config {

    public int livenessPort = 8091;

    public Auth auth = new Auth();

    @JsonSetter(nulls = Nulls.AS_EMPTY)
    public Map<String, String> services = new HashMap<>();

    public static class Auth {
        public String authServerUrl = "http://localhost:5100/";
        public String realm = "fairspace";
        public String clientId = "workspace-client";
        public boolean enableBasicAuth;
        public String superAdminUser = "organisation-admin";

        @JsonSetter(nulls = Nulls.AS_EMPTY)
        public final Set<String> defaultUserRoles = new HashSet<>();
    }

}
