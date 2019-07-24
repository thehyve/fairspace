package io.fairspace.saturn.services;

import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.RDFDataMgr;

import java.io.StringReader;
import java.io.StringWriter;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.riot.RDFFormat.JSONLD;

@Slf4j
public class JsonLDUtils {
    public static final String JSON_LD_HEADER_STRING = JSONLD.getLang().getHeaderString();

    public static String toJsonLD(Model model) {
        var writer = new StringWriter();
        RDFDataMgr.write(writer, model, JSONLD);
        return writer.toString();
    }

    public static Model fromJsonLD(String json, String baseURI) throws PayloadParsingException {
        try {
            var model = createDefaultModel();
            RDFDataMgr.read(model, new StringReader(json), baseURI, JSONLD.getLang());
            return model;
        } catch (Exception e) {
            throw new PayloadParsingException(e);
        }
    }
}
