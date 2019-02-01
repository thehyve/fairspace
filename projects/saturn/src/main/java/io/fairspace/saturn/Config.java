package io.fairspace.saturn;

import lombok.Getter;
import lombok.Setter;
import org.yaml.snakeyaml.Yaml;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;

@Getter
@Setter
public class Config {
    String vocabularyURI;

    int port;

    String datasetPath;

    String transactionLogPath;

    boolean authEnabled;

    URL jwksUrl;

    String jwtAlgorithm;
}
