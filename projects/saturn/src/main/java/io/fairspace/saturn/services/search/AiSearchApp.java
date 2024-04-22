package io.fairspace.saturn.services.search;

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
            try {
                res.type(APPLICATION_JSON.asString());
                return new LlmConversation().getAllConversationsForUser(getUserKey());
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

                var conversationId = req.params().get(":id");

                res.type(APPLICATION_JSON.asString());
                return new LlmConversation().getConversationHistory(conversationId);
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

                res.type(APPLICATION_JSON.asString());
                return result;
            } catch (Exception e) {
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
