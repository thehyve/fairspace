package io.fairspace.ceres.metadata.repository

import mu.KotlinLogging.logger
import org.apache.jena.query.Dataset
import org.apache.jena.query.Query.*
import org.apache.jena.query.QueryExecutionFactory
import org.apache.jena.query.QueryFactory
import org.apache.jena.query.ResultSet
import org.apache.jena.rdf.model.*
import org.apache.jena.rdf.model.ModelFactory.createInfModel
import org.apache.jena.reasoner.Reasoner
import org.apache.jena.sparql.resultset.ResultSetMem
import org.apache.jena.system.Txn.calculateRead
import org.apache.jena.system.Txn.executeWrite
import org.springframework.stereotype.Component
import java.net.URI
import java.net.URISyntaxException
import javax.validation.ValidationException

@Component
class ModelRepository(private val dataset: Dataset, private val reasoner: Reasoner) {
    private val models = ThreadLocal.withInitial { extendedModel(dataset.defaultModel) }

    private val log = logger {}

    fun list(subject: String? = null, predicate: String? = null, obj: String? = null): Model {
        log.trace { "Retrieving statements for s: $subject p: $predicate o: $obj" }
        return read { model ->
            model.listStatements(subject?.let(model::createResource), predicate?.let(model::createProperty), obj?.let(model::createResource))
                    .toModel()
        }
    }

    fun add(delta: Model) {
        log.trace { "Adding statements: $delta" }
        validate(delta)
        write { model -> model.add(delta) }
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
        write { model ->
            extendedModel(list(subject, predicate, obj))
                    .listStatements()
                    .forEach { model.remove(it) }
        }
    }

    fun query(queryString: String): Any { // ResultSet | Model | Boolean
        log.trace { "Executing SPARQL: ${toSingleLine(queryString)}" }
        return read { model ->
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

    /**
     * To handle inferred statements properly this method first searches for statements matching subject-predicate pairs
     * from the delta model, then it extends the found statements with statements which can be inferred from then,
     * removes the extended set, and finally adds the delta model.
     */
    fun update(delta: Model) {
        log.trace { "Updating statements: $delta" }
        validate(delta)
        write { model ->
            delta.listStatements()
                    .forEach {
                        val siblings = model.listStatements(it.subject, it.predicate, null as? RDFNode).toModel()
                        extendedModel(siblings)
                                .listStatements()
                                .forEach { stmt -> model.remove(stmt) }
                    }
            model.add(delta)
        }
    }

    private fun <R> read(action: (InfModel) -> R): R = calculateRead(dataset) { action(models.get()) }

    private fun write(action: (InfModel) -> Unit) = executeWrite(dataset) { action(models.get()) }

    private fun ResultSet.detach() = ResultSetMem(this)

    private fun Model.detach() = ModelFactory.createDefaultModel().add(this)

    /**
     * Adds inferred statements to a model
     */
    private fun extendedModel(model: Model) = createInfModel(reasoner, model)

    private fun toSingleLine(s: String) =
            s.splitToSequence('\n')
                    .map(String::trim)
                    .filter(CharSequence::isNotEmpty)
                    .joinToString(" ")

    @Throws(ValidationException::class)
    private fun validate(model: Model): Model = model.apply {
            listStatements().forEach {
                validate(it.subject)
                validate(it.predicate)
                validate(it.`object`)
            }
    }

    @Throws(ValidationException::class)
    private fun validate(node: RDFNode) {
        if (node.isURIResource) {
            try {
                URI(node.asResource().uri)
            } catch (e: URISyntaxException) {
                throw ValidationException("The model contains an invalid URI: " + e.input, e)
            }
        }
    }
}
