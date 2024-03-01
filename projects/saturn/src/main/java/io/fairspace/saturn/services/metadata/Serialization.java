package io.fairspace.saturn.services.metadata;

import java.io.StringReader;
import java.io.StringWriter;
import java.util.*;
import java.util.stream.Collectors;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;

import io.fairspace.saturn.util.UnsupportedMediaTypeException;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;

public class Serialization {
    private static final List<RDFFormat> SUPPORTED_FORMATS =
            List.of(RDFFormat.JSONLD, RDFFormat.TURTLE, RDFFormat.NTRIPLES);

    private static final List<String> SUPPORTED_MIMETYPES =
            SUPPORTED_FORMATS.stream().map(f -> f.getLang().getHeaderString()).collect(Collectors.toList());

    public static Model deserialize(String body, String contentType) {
        var model = createDefaultModel();
        RDFDataMgr.read(
                model, new StringReader(body), null, getFormat(contentType).getLang());
        return model;
    }

    public static String serialize(Model model, RDFFormat format) {
        var writer = new StringWriter();
        RDFDataMgr.write(writer, model, format);
        return writer.toString();
    }

    public static RDFFormat getFormat(String contentType) {
        if (contentType == null || contentType.isEmpty()) {
            return RDFFormat.TURTLE;
        }
        var types = Arrays.stream(contentType.split(","))
                .map(type -> type.split(";")[0].trim())
                .collect(Collectors.toSet());
        return SUPPORTED_FORMATS.stream()
                .filter(f -> types.contains(f.getLang().getHeaderString()))
                .findFirst()
                .or(() -> {
                    if (types.contains("*/*") || types.contains("text/*")) {
                        return Optional.of(RDFFormat.TURTLE);
                    }
                    return Optional.empty();
                })
                .orElseThrow(() -> new UnsupportedMediaTypeException(SUPPORTED_MIMETYPES));
    }
}
