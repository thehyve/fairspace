package io.fairspace.saturn.services.llm;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

import com.google.auth.oauth2.GoogleCredentials;
import org.json.JSONArray;
import org.json.JSONObject;

public class LlmConversation {
    private final String token;
    private final String ROOT_URL =
            "https://discoveryengine.googleapis.com/v1/projects/138804245472/locations/global/collections/default_collection/dataStores/frank-llm-search-datastore_1709824207320";

    public LlmConversation() throws IOException {
        try {
            this.token = new String(Base64.getDecoder().decode(System.getenv("LLM_API_KEY")));
        } catch (Exception exception) {
            throw new IOException("Failed to retrieve a valid api key.");
        }
    }

    public String search(String query) throws URISyntaxException, IOException, InterruptedException {
        if (query != null && !query.isEmpty()) {
            String requestData = "{\"query\":\"" + query
                    + "\",\"pageSize\":10,\"queryExpansionSpec\":{\"condition\":\"AUTO\"},\"spellCorrectionSpec\":{\"mode\":\"AUTO\"},\"contentSearchSpec\":{\"summarySpec\":{\"summaryResultCount\":5,\"ignoreAdversarialQuery\":true,\"includeCitations\":true},\"snippetSpec\":{\"returnSnippet\":true},\"extractiveContentSpec\":{\"maxExtractiveAnswerCount\":1}}}";
            String url = ROOT_URL + "/servingConfigs/default_search:search";
            String searchResult = this.postDiscoveryRequest(url, requestData);
            return searchResult;
        } else {
            return (new JSONObject()).toString();
        }
    }

    public String startChat(String userKey) throws URISyntaxException, IOException, InterruptedException {
        String url = ROOT_URL + "/conversations";
        String requestData = "{\"user_pseudo_id\": \"" + userKey + "\"}";
        String conversationJson = this.postDiscoveryRequest(url, requestData);
        String conversationId = this.getConversationId(conversationJson);
        JSONObject result = new JSONObject();
        result.put("conversationId", conversationId);
        return result.toString();
    }

    public String startChatWithQuery(String query, String userKey)
            throws URISyntaxException, IOException, InterruptedException {
        if (query != null && !query.isEmpty()) {
            String startChatResponse = this.startChat(userKey);
            String conversationId = new JSONObject(startChatResponse).getString("conversationId");
            String url = ROOT_URL + "/conversations/" + conversationId + ":converse";
            String requestData = "{ \"query\": { \"input\": \"" + query + "\" } }";
            String conversation = this.postDiscoveryRequest(url, requestData);
            conversation = this.setConversationIdInJson(conversation, conversationId);
            return conversation;
        } else {
            return (new JSONObject()).toString();
        }
    }

    public String getAllConversationsForUser(String userKey)
            throws URISyntaxException, IOException, InterruptedException {
        String url = ROOT_URL + "/conversations?filter=user_pseudo_id=" + userKey;
        String response = this.getDiscoveryRequest(url);
        var jsonResponse = new JSONObject(response);
        String values = this.extractIdAndTopicFromConversations(jsonResponse);
        return values;
    }

    public String getConversationHistory(String conversationId)
            throws URISyntaxException, IOException, InterruptedException {
        String url = ROOT_URL + "/conversations/" + conversationId;
        String response = this.getDiscoveryRequest(url);
        response = this.setConversationIdInJson(response, conversationId);
        return response;
    }

    public String continueChat(String conversationId, String query)
            throws URISyntaxException, IOException, InterruptedException {
        String url = ROOT_URL + "/conversations/" + conversationId + ":converse";
        String requestData = "{ \"query\": { \"input\": \"" + query + "\" } }";
        String conversation = this.postDiscoveryRequest(url, requestData);
        conversation = this.setConversationIdInJson(conversation, conversationId);
        return conversation;
    }

    public String deleteChat(String conversationId) throws URISyntaxException, IOException, InterruptedException {
        String url = ROOT_URL + "/conversations/" + conversationId;
        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(url))
                .headers(new String[] {"Content-Type", "application/json"})
                .headers(new String[] {"Accept", "application/json"})
                .headers(new String[] {"Authorization", "Bearer " + this.getToken()})
                .DELETE()
                .build();
        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
        return (String) response.body();
    }

    public String getStartTime(String time) {
        time = time.split("\\.")[0];
        LocalDateTime dateTime = LocalDateTime.parse(time);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return dateTime.format(formatter);
    }

    private String getDiscoveryRequest(String url) throws URISyntaxException, IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(url))
                .headers(new String[] {"Content-Type", "application/json"})
                .headers(new String[] {"Accept", "application/json"})
                .headers(new String[] {"Authorization", "Bearer " + this.getToken()})
                .GET()
                .build();
        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
        String body = (String) response.body();
        return body;
    }

    private String postDiscoveryRequest(String url, String requestData)
            throws URISyntaxException, IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(url))
                .headers(new String[] {"Content-Type", "application/json"})
                .headers(new String[] {"Accept", "application/json"})
                .headers(new String[] {"Authorization", "Bearer " + this.getToken()})
                .POST(BodyPublishers.ofString(requestData))
                .build();
        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
        String body = (String) response.body();
        return body;
    }

    private String getToken() throws IOException {
        return GoogleCredentials.fromStream(new ByteArrayInputStream(this.token.getBytes()))
                .createScoped(new String[] {"https://www.googleapis.com/auth/cloud-platform"})
                .refreshAccessToken()
                .getTokenValue();
    }

    private String setConversationIdInJson(String jsonString, String conversationId) {
        JSONObject conversation = new JSONObject(jsonString);
        if (conversation.has("conversation")) {
            conversation.getJSONObject("conversation").remove("name");
            conversation.getJSONObject("conversation").put("conversationId", conversationId);
            conversation.getJSONArray("searchResults").forEach((result) -> {
                ((JSONObject) result).remove("name");
            });
        }

        if (conversation.has("name")) {
            conversation.remove("name");
            conversation.put("conversationId", conversationId);
        }

        return conversation.toString();
    }

    private String extractIdAndTopicFromConversations(JSONObject jsonResponse) {
        JSONArray array = new JSONArray();
        if (!jsonResponse.has("conversations")) {
            return array.toString();
        } else {
            JSONArray allConversations = jsonResponse.getJSONArray("conversations");

            allConversations.forEach(arrayObject -> {
                addIdAndTopic(array, arrayObject);
            });

            return array.toString();
        }
    }

    private void addIdAndTopic(JSONArray array, Object arrayObject) {
        if (!(arrayObject instanceof JSONObject)) {
            return;
        }

        JSONObject conversation = (JSONObject) arrayObject;

        if (conversation.has("name") && conversation.has("messages")) {
            String id = conversation.getString("name")
                    .split("/")[conversation.getString("name").split("/").length - 1];
            String start = conversation.getString("startTime");
            JSONArray messages = conversation.getJSONArray("messages");
            if (messages.length() > 0) {
                JSONObject message = messages.getJSONObject(0);
                if (message.has("userInput")
                        && message.getJSONObject("userInput").has("input")) {
                    String topic = message.getJSONObject("userInput").getString("input");
                    JSONObject userInput = new JSONObject();
                    userInput.put("id", id);
                    userInput.put("topic", topic);
                    userInput.put("start", this.getStartTime(start));
                    array.put(userInput);
                }
            }
        }
    }

    private String getConversationId(String conversationJson) {
        String name = new JSONObject(conversationJson).getString("name");
        return name.split("/")[name.split("/").length - 1];
    }
}
