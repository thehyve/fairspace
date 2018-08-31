package io.fairspace.ceres.web.converters

import org.apache.jena.query.ResultSet
import org.apache.jena.query.ResultSetFormatter
import org.springframework.http.HttpInputMessage
import org.springframework.http.HttpOutputMessage
import org.springframework.http.MediaType
import org.springframework.http.converter.AbstractHttpMessageConverter
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.http.converter.HttpMessageNotWritableException
import java.io.IOException

class ResultSetConverter : AbstractHttpMessageConverter<ResultSet>(SPARQL_RESULTS) {
    override fun supports(clazz: Class<*>): Boolean {
        return ResultSet::class.java.isAssignableFrom(clazz)
    }

    @Throws(IOException::class, HttpMessageNotReadableException::class)
    override fun readInternal(clazz: Class<out ResultSet>, inputMessage: HttpInputMessage): ResultSet {
        throw NotImplementedError()
    }

    @Throws(IOException::class, HttpMessageNotWritableException::class)
    override fun writeInternal(resultSet: ResultSet, outputMessage: HttpOutputMessage) {
        ResultSetFormatter.outputAsJSON(outputMessage.body, resultSet)
    }

    companion object {
        val SPARQL_RESULTS = MediaType.valueOf("application/sparql-results+json")
    }
}