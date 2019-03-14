package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.rdf.Vocabulary;
import io.fairspace.saturn.services.metadata.validation.MetadataRequestValidator;
import io.fairspace.saturn.services.metadata.validation.ProtectMachineOnlyPredicatesValidator;
import io.fairspace.saturn.util.UnsupportedMediaTypeException;
import org.apache.jena.graph.Node;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.riot.RiotException;
import spark.servlet.SparkApplication;

import static io.fairspace.saturn.services.ModelUtils.*;
import static io.fairspace.saturn.services.errors.ErrorHelper.errorBody;
import static io.fairspace.saturn.services.errors.ErrorHelper.exceptionHandler;
import static io.fairspace.saturn.util.ValidationUtils.validateContentType;
import static javax.servlet.http.HttpServletResponse.*;
import static org.apache.jena.riot.RDFFormat.JSONLD;
import static spark.Spark.*;

public class MetadataApp implements SparkApplication {
    private final String basePath;
    private final MetadataService api;

    public MetadataApp(String basePath, RDFConnection rdfConnection, Node graph, Vocabulary vocabulary) {
        this.basePath = basePath;

        MetadataRequestValidator validator = new ProtectMachineOnlyPredicatesValidator(vocabulary);
        this.api = new MetadataService(rdfConnection, graph, vocabulary.getVocabularyGraph(), validator);
    }

    @Override
    public void init() {
        path(basePath, () -> {
            get("/", JSON_LD, (req, res) -> {
                res.type(JSON_LD);
                return toJsonLD(api.get(
                        req.queryParams("subject"),
                        req.queryParams("predicate"),
                        req.queryParams("object"),
                        req.queryParams().contains("labels")));
            });
            get("/entities/", JSON_LD, (req, res) -> {
                res.type(JSONLD.getLang().getHeaderString());
                return toJsonLD(api.getByType(req.queryParams("type")));
            });
            put("/", (req, res) -> {
                validateContentType(req, JSON_LD);
                api.put(fromJsonLD(req.body()));
                return "";
            });
            patch("/", (req, res) -> {
                validateContentType(req, JSON_LD);
                api.patch(fromJsonLD(req.body()));
                return "";
            });
            delete("/", (req, res) -> {
                if (JSON_LD.equals(req.contentType())) {
                    api.delete(fromJsonLD(req.body()));
                } else {
                    api.delete(req.queryParams("subject"), req.queryParams("predicate"), req.queryParams("object"));
                }
                return "";
            });
            notFound((req, res) -> errorBody(SC_NOT_FOUND, "Not found"));
            exception(RiotException.class, exceptionHandler(SC_BAD_REQUEST, "Malformed request body"));
            exception(UnsupportedMediaTypeException.class, exceptionHandler(SC_UNSUPPORTED_MEDIA_TYPE, null));
            exception(IllegalArgumentException.class, exceptionHandler(SC_BAD_REQUEST, null));
        });
    }
}
