package io.fairspace.ceres.metadata.repository

import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.Resource
import org.apache.jena.rdf.model.Statement
import org.apache.jena.rdf.model.StmtIterator
import org.apache.jena.util.iterator.WrappedIterator

class PropertyInverter(properties: Sequence<Pair<String, String>>) {
    private val map = mutableMapOf<String, String>().apply {
        properties.forEach {
            put(it.first, it.second)
            put(it.second, it.first)
        }
    }

    fun extend(model: Model): StmtIterator = extend(model.listStatements())

    fun extend(iterator: StmtIterator): StmtIterator =
            object : WrappedIterator<Statement>(iterator, true), StmtIterator {
                private var inferred: Statement? = null

                override fun next(): Statement =
                        inferred?.also { inferred = null }
                                ?: base.next().also { s ->
                                    map[s.predicate.uri]?.let { inverse ->
                                        inferred = s.model.createStatement(
                                                s.`object` as Resource,
                                                s.model.createProperty(inverse),
                                                s.subject)
                                    }
                                }

                override fun hasNext(): Boolean = (inferred != null) || base.hasNext()

                override fun nextStatement(): Statement = next()
            }
}
