package io.fairspace.ceres

import io.fairspace.ceres.repository.toString
import io.ktor.application.ApplicationCall
import io.ktor.content.TextContent
import io.ktor.features.ContentConverter
import io.ktor.features.UnsupportedMediaTypeException
import io.ktor.http.ContentType
import io.ktor.pipeline.PipelineContext
import io.ktor.request.ApplicationReceiveRequest
import io.ktor.request.contentType
import kotlinx.coroutines.experimental.io.ByteReadChannel
import kotlinx.coroutines.experimental.io.jvm.javaio.toInputStream
import org.apache.jena.query.ResultSet
import org.apache.jena.query.ResultSetFormatter
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.riot.RDFDataMgr
import org.apache.jena.riot.RDFFormat
import java.io.ByteArrayOutputStream

class ModelConverter(private val format: RDFFormat) : ContentConverter {
    val contentType = ContentType.parse(format.lang.headerString)

    override suspend fun convertForReceive(context: PipelineContext<ApplicationReceiveRequest, ApplicationCall>): Model {
        return ModelFactory.createDefaultModel().also {
            val channel = context.subject.value as ByteReadChannel
            RDFDataMgr.read(it, channel.toInputStream(), format.lang)
        }
    }

    override suspend fun convertForSend(context: PipelineContext<Any, ApplicationCall>, contentType: ContentType, value: Any): Any? {
        if (value is Model) {
            return TextContent(value.toString(format), contentType)
        } else throw UnsupportedMediaTypeException(contentType)
    }
}

object ResultSetJsonConverter : ContentConverter {
    override suspend fun convertForSend(context: PipelineContext<Any, ApplicationCall>, contentType: ContentType, value: Any): Any? {
        if (value is ResultSet) {
            val out = ByteArrayOutputStream()
            ResultSetFormatter.outputAsJSON(out, value)
            return out.toString()
        } else throw UnsupportedMediaTypeException(contentType)
    }

    override suspend fun convertForReceive(context: PipelineContext<ApplicationReceiveRequest, ApplicationCall>): Any? {
        throw UnsupportedMediaTypeException(context.context.request.contentType())
    }
}

object TextConverter : ContentConverter {
    override suspend fun convertForReceive(context: PipelineContext<ApplicationReceiveRequest, ApplicationCall>): Any? {
        throw UnsupportedMediaTypeException(context.context.request.contentType())
    }

    override suspend fun convertForSend(context: PipelineContext<Any, ApplicationCall>, contentType: ContentType, value: Any): Any? {
        return TextContent(value.toString(), contentType)
    }
}