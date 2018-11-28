package io.fairspace.ceres.metadata.repository

import mu.KotlinLogging.logger
import org.apache.jena.query.Dataset
import org.apache.jena.query.Query.*
import org.apache.jena.query.QueryExecutionFactory
import org.apache.jena.query.QueryFactory
import org.apache.jena.query.ResultSet
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.reasoner.Reasoner
import org.apache.jena.sparql.resultset.ResultSetMem
import org.apache.jena.system.Txn
import org.springframework.stereotype.Component

@Component
class ModelRepository(private val dataset: Dataset, reasoner: Reasoner) {
    private val model = ModelFactory.createInfModel(reasoner, dataset.defaultModel)
    private val log = logger {}

    fun list(subject: String?, predicate: String? = null, obj: String? = null): Model {
        log.trace { "Retrieving statements for s: $subject p: $predicate o: $obj" }
        return read {
            listStatements(subject?.let(::createResource), predicate?.let(::createProperty), obj?.let(::createResource))
                    .toModel()
        }
    }

    fun add(delta: Model) {
        log.trace { "Adding statements: $delta" }
        write { add(delta) }
    }

    fun remove(subject: String?, predicate: String? = null) {
        log.trace { "Removing statements for s: $subject p: $predicate" }
        write {
            removeAll(subject?.let(::createResource), predicate?.let(::createProperty), null)
        }
    }

    fun query(queryString: String): Any { // ResultSet | Model | Boolean
        log.trace { "Executing SPARQL: ${toSingleLine(queryString)}" }
        return read {
            QueryExecutionFactory.create(QueryFactory.create(queryString), this).run {
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

    fun update(delta: Model) {
        log.trace { "Updating statements: $delta" }
        write {
            delta.listStatements().forEach {
                removeAll(it.subject, it.predicate, null)
            }
            add(delta)
        }
    }

    private fun <R> read(action: Model.() -> R): R = Txn.calculateRead(dataset) { action(model) }

    private fun write(action: Model.() -> Unit) = Txn.executeWrite(dataset) { action(model) }

    private fun ResultSet.detach() = ResultSetMem(this)

    private fun Model.detach() = ModelFactory.createDefaultModel().add(this)

    private fun toSingleLine(s: String) =
            s.splitToSequence('\n')
                    .map(String::trim)
                    .filter(CharSequence::isNotEmpty)
                    .joinToString(" ")
}
