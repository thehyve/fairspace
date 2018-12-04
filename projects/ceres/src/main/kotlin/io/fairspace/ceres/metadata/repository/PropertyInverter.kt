package io.fairspace.ceres.metadata.repository

import org.apache.jena.rdf.model.*
import org.apache.jena.util.iterator.WrappedIterator
import org.apache.jena.vocabulary.OWL2

open class PropertyInverter(properties: Iterable<Pair<String, String>>): Enhancer() {
    private val map = mutableMapOf<String, String>().apply {
        properties.forEach {
            put(it.first, it.second)
            put(it.second, it.first)
        }
    }

    override fun enhance(iterator: StmtIterator): StmtIterator =
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


class OwlPropertyInverter(model: Model) : PropertyInverter(
        model.listStatements(null, OWL2.inverseOf, null as? RDFNode)
                .mapWith { it.subject.uri to it.`object`.asResource().uri }
                .toList())