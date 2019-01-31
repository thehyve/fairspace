package io.fairspace.saturn.commits;


import static org.eclipse.jetty.server.HttpConnection.getCurrentConnection;

/**
 * Manages commit messages.
 * A commit message can be set either externally using Saturn-Commit-Message header of the incoming HTTP request
 * or by calling withCommitMessage.
 */
public class CommitMessages {
    public static final String COMMIT_MESSAGE_HEADER = "Saturn-Commit-Message";

    private static final ThreadLocal<String> systemCommitMessage = new ThreadLocal<>();

    public static void withCommitMessage(String message, Runnable action) {
        systemCommitMessage.set(message);
        try {
            action.run();
        } finally {
            systemCommitMessage.set(null);
        }
    }

    public static String getCommitMessage() {
        var systemMessage = systemCommitMessage.get();
        if (systemMessage != null) {
           return systemMessage;
        }
        var connection = getCurrentConnection();
        if (connection == null) {
            return null;
        }
        var request = connection.getHttpChannel().getRequest();
        if (request == null) {
            return null;
        }

        return request.getHeader(COMMIT_MESSAGE_HEADER);
    }
}
