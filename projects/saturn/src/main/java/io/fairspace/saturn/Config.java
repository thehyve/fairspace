package io.fairspace.saturn;

public interface Config {
    String vocabularyURI();

    int port();

    String datasetPath();

    String transactionLogPath();
}
