package io.fairspace.ceres.repository

import org.apache.jena.query.Dataset
import org.apache.jena.query.ReadWrite
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.riot.RDFDataMgr
import org.apache.jena.riot.RDFFormat
import java.io.*

fun <R> Dataset.read(model: String, action: Model.() -> R): R {
    begin(ReadWrite.READ)
    try {
        return action(getNamedModel(model))
    } finally {
        end()
    }
}

fun Dataset.write(model: String, action: Model.() -> Unit) {
    begin(ReadWrite.WRITE)
    try {
        action(getNamedModel(model))
        commit()
    } catch (e: Exception) {
        abort()
    }
}

fun Model.toString(format: RDFFormat): String =
        StringWriter().let { RDFDataMgr.write(it, this, format); it.toString() }

fun RDFFormat.parse(text: String): Model =
        ModelFactory.createDefaultModel().also {
            RDFDataMgr.read(it, StringReader(text), null, lang)
        }