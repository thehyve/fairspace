package io.fairspace.saturn.services.search;

import java.io.FileWriter;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.stream.Collectors;

import lombok.extern.log4j.*;
import nl.hyve.llm.LlmConversation;
import org.json.JSONObject;
import spark.Request;

import io.fairspace.saturn.services.BaseApp;

import static io.fairspace.saturn.auth.RequestContext.getAccessToken;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.get;
import static spark.Spark.post;

@Log4j2
public class AiSearchApp extends BaseApp {
    final String CACHE_DIR = "./data/conversations/";

    public AiSearchApp(String basePath) {
        super(basePath);
    }

    @Override
    protected void initApp() {
        get("/newchat", "application/json", (req, res) -> {
            try {
                res.type(APPLICATION_JSON.asString());
                return new LlmConversation().startChat(getUserKey());
            } catch (Exception e) {
                return handleError(req, e);
            }
        });

        get("/allconversations", "application/json", (req, res) -> {
            if (!Files.exists(Paths.get(CACHE_DIR + getUserKey()))) {
                return new ArrayList<JSONObject>();
            }

            try (var conversations = Files.list(Paths.get(CACHE_DIR + getUserKey()))) {
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
                                        .getStartTime(obj.getJSONObject("conversation")
                                                .getString("startTime")));

                        result.add(conversation);
                    } catch (Exception e) {
                        System.out.println(
                                "Error extracting conversation id, input message, and start time: " + e.getMessage());
                    }
                }

                res.type(APPLICATION_JSON.asString());
                return result;
            } catch (Exception e) {
                return handleError(req, e);
            }
        });

        get("/history/:id", "application/json", (req, res) -> {
            try {
                boolean keyExists = req.params() != null && req.params().containsKey(":id");

                if (!keyExists) {
                    return "Please provide a valid conversationid.";
                }

                var conversationId = req.params(":id");

                res.type(APPLICATION_JSON.asString());
                return new LlmConversation().getConversationHistory(conversationId);
            } catch (Exception e) {
                return handleError(req, e);
            }
        });

        get("/conversation/:id", "application/json", (req, res) -> {
            try {
                boolean keyExists = req.params() != null && req.params().containsKey(":id");

                if (!keyExists) {
                    return "Please provide a valid conversationid.";
                }

                var conversationId = req.params(":id");
                var filename = CACHE_DIR + getUserKey() + "/" + conversationId + ".json";

                res.type(APPLICATION_JSON.asString());

                if (Files.exists(Paths.get(filename))) {
                    try {
                        var content = new String(Files.readAllBytes(Paths.get(filename)));
                        return content;
                    } catch (Exception e) {
                        System.out.println("Error reading conversation history file: " + e.getMessage());
                        var content = new String();
                        return content;
                    }
                } else {
                    System.out.println("Conversation history file " + filename + " does not exist.");
                    return "{}";
                }

            } catch (Exception e) {
                return handleError(req, e);
            }
        });

        post("/chat", "application/json", (req, res) -> {
            try {
                var body = new JSONObject(req.body());

                boolean keyExists = body.has("querytext");

                if (!keyExists) {
                    return "Please provide a querytext key in the request body";
                }

                var query = body.getString("querytext");
                var conversationId = body.getString("conversationId");

                var result = new LlmConversation().continueChat(conversationId, query);
                var filepath = CACHE_DIR + getUserKey();
                var file = new java.io.File(filepath + "/" + conversationId + ".json");

                Files.createDirectories(Paths.get(filepath));

                try (FileWriter writer = new FileWriter(file)) {
                    writer.write(result.toString());
                } catch (Exception e) {
                    System.out.println("Error writing conversation history file: " + e.getMessage());
                }

                res.type(APPLICATION_JSON.asString());
                return result;
            } catch (Exception e) {
                return handleError(req, e);
            }
        });

        post("/deletechat/:id", "application/json", (req, res) -> {
            try {
                boolean keyExists = req.params() != null && req.params().containsKey(":id");

                if (!keyExists) {
                    return "Please provide a valid conversationid.";
                }

                var conversationId = req.params(":id");
                var filename = CACHE_DIR + getUserKey() + "/" + conversationId + ".json";

                try {
                    Files.deleteIfExists(Paths.get(filename));
                } catch (Exception e) {
                    System.out.println("Error deleting conversation history file: " + e.getMessage());
                }

                var result = new LlmConversation().deleteChat(conversationId);

                res.type(APPLICATION_JSON.asString());
                return result;
            } catch (Exception e) {
                System.out.println("Error deleting conversation history file: " + e.getMessage());
                return handleError(req, e);
            }
        });

        post("/", "application/json", (req, res) -> {
            try {
                var body = new JSONObject(req.body());

                boolean keyExists = body.has("querytext");

                if (!keyExists) {
                    return "Please provide a querytext key in the request body";
                }

                var query = body.getString("querytext");
                var searchResult = new LlmConversation().startChatWithQuery(query, getUserKey());
                res.type(APPLICATION_JSON.asString());

                return searchResult;
            } catch (Exception e) {
                return handleError(req, e);
            }
        });
    }

    private Object handleError(Request req, Exception e) {
        log.error("Unexpected error in AiSearchApp: " + e.getMessage() + "\n\nrequest: " + req.body());
        return "{}";
    }

    private String getUserKey() {
        var token = getAccessToken();

        if (token.getIssuedFor() != null && token.getPreferredUsername() != null) {
            return Math.abs(token.getIssuedFor().hashCode()) + "@"
                    + Math.abs(token.getPreferredUsername().hashCode());
        }

        throw new UnsupportedOperationException("User key not found in token");
    }
}
