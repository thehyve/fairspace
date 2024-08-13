package io.fairspace.saturn.services.llm;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.stream.Collectors;

import lombok.extern.log4j.Log4j2;
import org.json.JSONObject;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;

@Log4j2
public class ConversationCache {
    final String CACHE_DIR = CONFIG.llmConversationCachePath;

    public ArrayList<JSONObject> getAllConversations(String userKey) throws IOException {
        if (!Files.exists(Paths.get(CACHE_DIR + userKey))) {
            return new ArrayList<JSONObject>();
        }

        try (var conversations = Files.list(Paths.get(CACHE_DIR + userKey))) {
            var content = conversations
                    .map(path -> {
                        try {
                            return new String(Files.readAllBytes(path));
                        } catch (Exception e) {
                            return "{}";
                        }
                    })
                    .collect(Collectors.toList());

            var result = new ArrayList<JSONObject>();
            for (var c : content) {
                try {
                    var obj = new JSONObject(c);
                    var conversation = new JSONObject();
                    conversation.put("id", obj.getJSONObject("conversation").getString("conversationId"));
                    conversation.put(
                            "topic",
                            obj.getJSONObject("conversation")
                                    .getJSONArray("messages")
                                    .getJSONObject(0)
                                    .getJSONObject("userInput")
                                    .getString("input"));
                    conversation.put(
                            "start",
                            new LlmConversation()
                                    .getStartTime(
                                            obj.getJSONObject("conversation").getString("startTime")));

                    result.add(conversation);
                } catch (Exception e) {
                    log.error("Error extracting conversation id, input message, and start time: " + e.getMessage());
                    throw e;
                }
            }

            return result;
        } catch (IOException e) {
            log.error(e);
            throw e;
        }
    }

    public String GetConversation(String conversationId, String userKey) {
        var filename = CACHE_DIR + userKey + "/" + conversationId + ".json";
        if (Files.exists(Paths.get(filename))) {
            try {
                var content = new String(Files.readAllBytes(Paths.get(filename)));
                return content;
            } catch (Exception e) {
                log.error("Error reading conversation history file: " + e.getMessage(), e);
                return "{}";
            }
        } else {
            log.error("Conversation history file " + filename + " does not exist.");
            return "{}";
        }
    }

    public void saveConversation(String conversationId, String userKey, String result) throws IOException {
        var filepath = CACHE_DIR + userKey;
        var file = new java.io.File(filepath + "/" + conversationId + ".json");

        Files.createDirectories(Paths.get(filepath));

        try (FileWriter writer = new FileWriter(file)) {
            writer.write(result.toString());
        } catch (Exception e) {
            log.error("Error writing conversation history file: " + e.getMessage());
        }
    }

    public void deleteChat(String conversationId, String userKey) {
        var filename = CACHE_DIR + userKey + "/" + conversationId + ".json";

        try {
            Files.deleteIfExists(Paths.get(filename));
        } catch (Exception e) {
            log.error("Error deleting conversation history file: " + e.getMessage());
        }
    }
}
