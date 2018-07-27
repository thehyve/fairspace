package io.fairspace.neptune.web;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

public class JsonldModelConverter extends AbstractHttpMessageConverter<Model> {
    public static final MediaType JSON_LD = MediaType.valueOf(RDFFormat.JSONLD.getLang().getHeaderString());

    public JsonldModelConverter() {
        super(JSON_LD);
    }

    @Override
    public List<MediaType> getSupportedMediaTypes() {
        return Collections.singletonList(JSON_LD);
    }

    @Override
    protected boolean supports(Class<?> clazz) {
        return Model.class.isAssignableFrom(clazz);
    }

    @Override
    protected Model readInternal(Class<? extends Model> clazz, HttpInputMessage inputMessage) throws IOException, HttpMessageNotReadableException {
        Model model = ModelFactory.createDefaultModel();
        RDFDataMgr.read(model, inputMessage.getBody(), RDFFormat.JSONLD.getLang());
        return model;
    }

    @Override
    protected void writeInternal(Model model, HttpOutputMessage outputMessage) throws IOException, HttpMessageNotWritableException {
        RDFDataMgr.write(outputMessage.getBody(), model, RDFFormat.JSONLD.getLang());
    }
}
