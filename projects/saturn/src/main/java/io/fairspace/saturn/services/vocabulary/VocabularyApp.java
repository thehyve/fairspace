package io.fairspace.saturn.services.vocabulary;

import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.riot.RiotException;
import spark.servlet.SparkApplication;

import static io.fairspace.saturn.services.ModelUtils.fromJsonLD;
import static io.fairspace.saturn.services.ModelUtils.toJsonLD;
import static io.fairspace.saturn.services.errors.ErrorHelper.returnError;
import static javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
import static org.apache.jena.riot.RDFFormat.JSONLD;
import static spark.Spark.*;

public class VocabularyApp implements SparkApplication {
    private final VocabularyService api;

    public VocabularyApp(RDFConnection rdfConnection) {
        this.api = new VocabularyService(rdfConnection);
    }

    @Override
    public void init() {
        path("/api/vocabulary", () -> {
            get("/", JSONLD.getLang().getHeaderString(), (req, res) -> {
                res.type(JSONLD.getLang().getHeaderString());
                return toJsonLD(api.getVocabulary());
            });
            put("/", (req, res) -> {
                var vocabulary = fromJsonLD(req.body());
                api.setVocabulary(vocabulary);
                return "";
            });
            exception(RiotException.class, (e, req, res) -> returnError(res, SC_BAD_REQUEST, "Malformed request body"));
        });
    }
}
