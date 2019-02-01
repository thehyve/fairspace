package io.fairspace.saturn;

import java.net.URL;

public interface Config {
    String vocabularyURI();

    int port();

    String datasetPath();

    String transactionLogPath();

    boolean authEnabled();

    URL jwksUrl();

    String jwksAlgorithm();
}
