package io.fairspace.ceres.metadata.repository

import org.apache.jena.rdf.model.*
import org.apache.jena.util.iterator.WrappedIterator
import org.apache.jena.vocabulary.OWL2
import javax.xml.bind.ValidationException

open class PropertyInverter(properties: Iterable<Pair<String, String>>): Enhancer() {
    private val map = mutableMapOf<String, String>().apply {
        properties.forEach {
            put(it.first, it.second)
            put(it.second, it.first)
        }
    }

    override fun addedStatement(s: Statement) {
        invert(s, true)
    }

                override fun next(): Statement {
                    val result: Statement
                    if (inferred != null) {
                        result = inferred!!
                        inferred = null
                    } else {
                        result = base.next()
                        inferred = invert(result)
                    }
                    return result
                }

                private fun invert(statement: Statement): Statement? =
                        map[statement.predicate.uri]?.let { inverseProperty ->
                            if (statement.`object` is Resource)
                                statement.model.createStatement(
                                        statement.`object` as Resource,
                                        statement.model.createProperty(inverseProperty),
                                        statement.subject)
                             else throw ValidationException("Statement $statement cannot be inverted, its object is not a RDF resource")
                        }

                override fun hasNext(): Boolean = (inferred != null) || base.hasNext()

                override fun nextStatement(): Statement = next()
            }
}


class OwlPropertyInverter(model: Model) : PropertyInverter(
        model.listStatements(null, OWL2.inverseOf, null as? RDFNode)
                .mapWith { it.subject.uri to it.`object`.asResource().uri }
                .toList())