package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.util.UnsupportedMediaTypeException;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;
import spark.Request;
import spark.Response;

import java.io.IOException;
import java.io.StringReader;
import java.util.List;
import java.util.stream.Collectors;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.eclipse.jetty.http.MimeTypes.getContentTypeWithoutCharset;

public class Serialization {
    private static final List<RDFFormat> SUPPORTED_FORMATS = List.of(RDFFormat.JSONLD, RDFFormat.TURTLE, RDFFormat.NTRIPLES);

    private static final List<String> SUPPORTED_MIMETYPES = SUPPORTED_FORMATS
            .stream()
            .map(f -> f.getLang().getHeaderString())
            .collect(Collectors.toList());

    public static Model read(Request request) {
                var model = createDefaultModel();
                RDFDataMgr.read(model, new StringReader(request.body()), null, getFormat(request.contentType()).getLang());
                return model;
    }

    public static void write(Model model, Response response, String acceptHeader) throws IOException {
        var format = getFormat(acceptHeader);
        response.type(format.getLang().getHeaderString());
        RDFDataMgr.write(response.raw().getOutputStream(), model, format);
    }

    private static RDFFormat getFormat(String headerString) {
        var type = getContentTypeWithoutCharset(headerString);
        return SUPPORTED_FORMATS.stream()
                .filter(f -> f.getLang().getHeaderString().equals(type))
                .findFirst()
                .orElseThrow(() -> new UnsupportedMediaTypeException(SUPPORTED_MIMETYPES));
    }
}
