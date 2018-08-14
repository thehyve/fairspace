package io.fairspace.ceres.repository

import org.apache.jena.query.Dataset
import org.apache.jena.query.ReadWrite
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.riot.RDFDataMgr
import org.apache.jena.riot.RDFFormat
import java.io.*

fun <R> Dataset.read(action: Model.() -> R): R {
    begin(ReadWrite.READ)
    try {
        return action(defaultModel)
    } finally {
        end()
    }
}

fun Dataset.write(action: Model.() -> Unit) {
    begin(ReadWrite.WRITE)
    try {
        action(defaultModel)
        commit()
    } catch (e: Exception) {
        abort()
        throw e
    }
}

fun Model.toString(format: RDFFormat): String =
        StringWriter().let { RDFDataMgr.write(it, this, format); it.toString() }

fun RDFFormat.parse(text: String): Model =
        ModelFactory.createDefaultModel().also {
            RDFDataMgr.read(it, StringReader(text), null, lang)
        }
