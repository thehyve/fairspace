package io.fairspace.saturn.services.errors;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.fairspace.saturn.vocabulary.FS;
import org.junit.Test;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.*;


public class ErrorHelperTest {

    @Test
    public void errorBody() throws IOException {
        var errorBody = ErrorHelper.errorBody(100, "Message", List.of("a", "b"));

        // Parse the json body
        Map parsedMap = new ObjectMapper().readValue(errorBody, Map.class);

        // Expect the properties to be serialized as json
        assertEquals(100, parsedMap.get("status"));
        assertEquals("Message", parsedMap.get("message"));
        assertEquals( List.of("a", "b"), parsedMap.get("details"));
    }

    @Test
    public void errorBodyContext() throws IOException {
        var errorBody = ErrorHelper.errorBody(100, "Message", List.of("a", "b"));

        // Parse the json body
        Map parsedMap = new ObjectMapper().readValue(errorBody, Map.class);

        // Expect the properties to be serialized as json
        assertEquals(FS.ERROR_URI, parsedMap.get("@type"));
        assertEquals(
                Map.of(
                    "details", FS.ERROR_DETAILS_URI,
                    "message", FS.ERROR_MESSAGE_URI,
                    "status", FS.ERROR_STATUS_URI
                ),
                parsedMap.get("@context")
        );
    }

}
