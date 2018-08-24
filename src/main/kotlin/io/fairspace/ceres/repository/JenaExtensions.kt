package io.fairspace.ceres.repository

import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.riot.RDFDataMgr
import org.apache.jena.riot.RDFFormat
import java.io.StringReader
import java.io.StringWriter


fun Model.toString(format: RDFFormat): String =
        StringWriter().let { RDFDataMgr.write(it, this, format); it.toString() }

fun RDFFormat.parse(text: String): Model =
        ModelFactory.createDefaultModel().also {
            RDFDataMgr.read(it, StringReader(text), null, lang)
        }
