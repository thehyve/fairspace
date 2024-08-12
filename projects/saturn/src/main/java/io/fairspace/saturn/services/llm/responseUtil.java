package io.fairspace.saturn.services.llm;

import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

public class responseUtil {
    public static String cleanupJson(String input) {
        return cleanupJson(new JSONObject(input));
    }

    public static String cleanupJsonArray(String input) {
        if (input == null) {
            return null;
        }

        var jsonElements = new JSONArray(input);

        jsonElements.forEach(element -> {
            cleanupJson((JSONObject) element);
        });

        return jsonElements.toString();
    }

    public static String cleanupJson(JSONObject jsonObject) {
        if (jsonObject.has("state")) {
            jsonObject.remove("state");
        }
        if (jsonObject.has("attributionToken")) {
            jsonObject.remove("attributionToken");
        }
        if (jsonObject.has("nextPageToken")) {
            jsonObject.remove("nextPageToken");
        }

        if (jsonObject.has("conversation")) {
            cleanupConversation(jsonObject.getJSONObject("conversation"));
        }
        if (jsonObject.has("searchResults")) {
            jsonObject.getJSONArray("searchResults").forEach(result -> {
                ((JSONObject) result).remove("name");
            });
        }

        cleanupReply(jsonObject);

        if (jsonObject.has("name")) {
            jsonObject.remove("name");
        }

        return jsonObject.toString();
    }

    private static void cleanupConversation(JSONObject conversation) {
        removeKeysLinear(conversation, new String[] {"name"});

        if (conversation.has("messages")) {
            conversation.getJSONArray("messages").forEach(message -> cleanupReply((JSONObject) message));
        }
    }

    private static void cleanupReply(JSONObject response) {
        removeLastKey(response, List.of("reply", "summary", "safetyAttributes"));
    }

    private static void removeKeysLinear(JSONObject jsonObject, String[] keys) {
        for (String key : keys) {
            if (jsonObject.has(key)) {
                jsonObject.remove(key);
            }
        }
    }

    // The first parameter should be present in 'jsonObject', the second
    // parameter is nested within the object that is the value of the first, etc.
    private static void removeLastKey(JSONObject jsonObject, List<String> keys) {
        if (keys.isEmpty() || jsonObject == null || !jsonObject.has(keys.getFirst())) {
            return;
        }

        if (keys.size() == 1) {
            jsonObject.remove(keys.getFirst());
            return;
        }

        var child = jsonObject.get(keys.getFirst());

        if (child instanceof JSONObject) {
            removeLastKey((JSONObject) child, keys.subList(1, keys.size()));
            return;
        } else if (child instanceof JSONArray) {
            ((JSONArray) child).forEach(element -> {
                removeLastKey((JSONObject) element, keys.subList(1, keys.size()));
            });
            return;
        }
    }
}
