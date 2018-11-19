package io.fairspace.callisto.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Test;

import java.io.IOException;

import static org.junit.Assert.*;

public class PermissionEventTest {

    @Test
    public void testAllFieldsNullable() throws IOException {
        ObjectMapper mapper = new ObjectMapper();

        String input = "{}";
        PermissionEvent permissionEvent = mapper.readValue(input, PermissionEvent.class);

        assertNull(permissionEvent.getCollection());
        assertNull(permissionEvent.getSubject());
        assertNull(permissionEvent.getUser());
        assertNull(permissionEvent.getPermission());
    }
}
