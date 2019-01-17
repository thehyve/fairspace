package io.fairspace.ceres.metadata.repository

import org.apache.jena.rdf.listeners.StatementListener
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.Property
import org.apache.jena.rdf.model.RDFNode
import org.apache.jena.rdf.model.ResourceFactory.createProperty
import org.apache.jena.rdf.model.Statement
import org.apache.jena.vocabulary.OWL2
import javax.validation.ValidationException

open class PropertyInverter(private val model: Model, properties: Iterable<Pair<String, String>>): StatementListener() {

    private val inversePropertiesMap = mutableMapOf<Property, Property>().apply {
        properties.forEach {
            val p1 = createProperty(it.first)
            val p2 = createProperty(it.second)
            put(p1, p2)
            put(p2, p1)
        }
    }

    override fun addedStatement(s: Statement) {
        process(s) { inverse ->
            if (!model.contains(inverse)) {
                model.add(inverse)
            }
        }
    }

    override fun removedStatement(s: Statement) {
        process(s) { inverse ->
            if (model.contains(inverse)) {
                model.remove(inverse)
            }
        }
    }

    private fun process(s: Statement, inverseStmtHandler: (Statement) -> Unit) {
        inversePropertiesMap[s.predicate]?.also {
            if(!s.`object`.isResource) {
                throw ValidationException("Statement $s cannot be inverted, its object is not a RDF resource")
            }

            inverseStmtHandler(model.createStatement(s.`object`.asResource(), it, s.subject))
        }
    }
}
class OwlPropertyInverter(targetModel: Model, inversionModel: Model) : PropertyInverter(targetModel,
        inversionModel.listStatements(null, OWL2.inverseOf, null as RDFNode?)
                .mapWith { it.subject.uri to it.`object`.asResource().uri }
                .toList())