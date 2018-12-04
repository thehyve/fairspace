package io.fairspace.ceres.metadata.repository

import mu.KotlinLogging.logger
import org.apache.jena.query.Query.*
import org.apache.jena.query.QueryExecutionFactory
import org.apache.jena.query.QueryFactory
import org.apache.jena.query.ResultSet
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory.createDefaultModel
import org.apache.jena.rdf.model.RDFNode
import org.apache.jena.sparql.resultset.ResultSetMem
import org.springframework.stereotype.Component

@Component
class ModelRepository(private val model: Model, private val propertyInverter: PropertyInverter) {

    private val log = logger {}

    fun list(subject: String? = null, predicate: String? = null, obj: String? = null): Model {
        log.trace { "Retrieving statements for s: $subject p: $predicate o: $obj" }

        return model.calculateInTxn {
            model.listStatements(subject.toResource(), predicate.toProperty(), obj.toResource()).toModel()
        }
    }

    fun add(delta: Model) {
        log.trace { "Adding statements: $delta" }
        model.executeInTxn { model.add(propertyInverter.extend(delta)) }
    }

    /**
     * By default deletion of an inferred statement in Jena never makes any changes to the statements physically stored
     * in the database, even if there's a "physical" statement which is an inverse of the deleted inferred statement,
     * e.g. isAChildOf and isAParentOf.
     * To handle deletion of inferred statements this method first searches for statements matching the provided criteria,
     * then it extends the found statements with whatever can be inferred from them, and finally deletes the extended set
     */
    fun remove(subject: String?, predicate: String? = null, obj: String? = null) {
        log.trace { "Removing statements for s: $subject p: $predicate" }
        model.executeInTxn {
            val found = model.listStatements(subject.toResource(), predicate.toProperty(), obj.toResource())
            val toRemove = propertyInverter.extend(found)
            model.remove(toRemove)
        }
    }

    /**
     * To handle inferred statements properly this method first searches for statements matching subject-predicate pairs
     * from the delta model, then it extends the found statements with statements which can be inferred from then,
     * removes the extended set, and finally adds the delta model.
     */
    fun update(delta: Model) {
        log.trace { "Updating statements: $delta" }

        val lhs = delta.listStatements().asSequence()
                .map { it.subject to it.predicate }
                .toSet()

        model.executeInTxn {
            lhs.forEach {
                val siblings = model.listStatements(it.first, it.second, null as? RDFNode)
                model.remove(propertyInverter.extend(siblings))
            }
            model.add(propertyInverter.extend(delta))
        }
    }


    fun query(queryString: String): Any { // ResultSet | Model | Boolean
        log.trace { "Executing SPARQL: ${toSingleLine(queryString)}" }
        return model.calculateInTxn {
            QueryExecutionFactory.create(QueryFactory.create(queryString), model).run {
                when (query.queryType) {
                    QueryTypeSelect -> execSelect().detach()
                    QueryTypeConstruct -> execConstruct().detach()
                    QueryTypeDescribe -> execDescribe().detach()
                    QueryTypeAsk -> execAsk()
                    else -> throw IllegalArgumentException("Cannot parse query: $queryString")
                }
            }
        }
    }


    private fun ResultSet.detach() = ResultSetMem(this)

    private fun Model.detach() = createDefaultModel().add(this)

    private fun toSingleLine(s: String) =
            s.splitToSequence('\n')
                    .map(String::trim)
                    .filter(CharSequence::isNotEmpty)
                    .joinToString(" ")

    private fun String?.toResource() = this?.let(model::createResource)

    private fun String?.toProperty() = this?.let(model::createProperty)
}
