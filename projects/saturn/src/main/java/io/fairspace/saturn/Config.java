package io.fairspace.saturn;

public interface Config {

    int port();

    String datasetPath();

    String transactionLogPath();
}
