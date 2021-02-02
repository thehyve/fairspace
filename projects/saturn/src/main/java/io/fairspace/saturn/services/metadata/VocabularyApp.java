package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.services.BaseApp;

import static io.fairspace.saturn.services.metadata.Serialization.getFormat;
import static io.fairspace.saturn.services.metadata.Serialization.serialize;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY;
import static spark.Spark.get;

public class VocabularyApp extends BaseApp {
    public VocabularyApp(String basePath) {
        super(basePath);
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            var format = getFormat(req.headers("Accept"));
            res.type(format.getLang().getHeaderString());
            return serialize(VOCABULARY, format);
        });
    }
}
