package io.fairspace.ceres.metadata.web.converters

import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.riot.RDFDataMgr
import org.apache.jena.riot.RDFFormat
import org.springframework.http.HttpInputMessage
import org.springframework.http.HttpOutputMessage
import org.springframework.http.MediaType
import org.springframework.http.converter.AbstractHttpMessageConverter
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.http.converter.HttpMessageNotWritableException
import java.io.IOException

class JsonLdModelConverter : AbstractHttpMessageConverter<Model>(JSON_LD) {

    override fun supports(clazz: Class<*>): Boolean {
        return Model::class.java.isAssignableFrom(clazz)
    }

    @Throws(IOException::class, HttpMessageNotReadableException::class)
    override fun readInternal(clazz: Class<out Model>, inputMessage: HttpInputMessage): Model {
        try {
            val model = ModelFactory.createDefaultModel()
            RDFDataMgr.read(model, inputMessage.body, RDFFormat.JSONLD.lang)
            return model
        } catch(e: Exception) {
            throw HttpMessageNotReadableException("Could not parse JSON-LD model", e)
        }
    }

    @Throws(IOException::class, HttpMessageNotWritableException::class)
    override fun writeInternal(model: Model, outputMessage: HttpOutputMessage) {
        RDFDataMgr.write(outputMessage.body, model, RDFFormat.JSONLD.lang)
    }

    companion object {
        val JSON_LD = MediaType.valueOf(RDFFormat.JSONLD.lang.headerString)
    }
}
