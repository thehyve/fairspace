package io.fairspace.saturn.vocabulary;

import org.apache.jena.rdf.model.Model;

import static org.apache.jena.riot.RDFDataMgr.loadModel;

public class Vocabularies {
    public static final Model SYSTEM_VOCABULARY = loadModel("system-vocabulary.ttl");
    public static final Model USER_VOCABULARY = loadModel("user-vocabulary.ttl");
    public static final Model VOCABULARY = SYSTEM_VOCABULARY.union(USER_VOCABULARY);
}
