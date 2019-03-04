package io.fairspace.saturn.services;

import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.RDFDataMgr;

import java.io.StringReader;
import java.io.StringWriter;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.riot.RDFFormat.JSONLD;

@Slf4j
public class ModelUtils {
    public static String toJsonLD(Model model) {
        var writer = new StringWriter();
        RDFDataMgr.write(writer, model, JSONLD);
        return writer.toString();
    }

    public static Model fromJsonLD(String json) {
        var model = createDefaultModel();
        RDFDataMgr.read(model, new StringReader(json), null, JSONLD.getLang());
        return model;
    }
}
