package io.fairspace.saturn;

import lombok.Value;

import java.util.Set;

@Value
public class UserInfo {
    String subject;
    String userName;
    String fullName;
    Set<String> roles;
}
