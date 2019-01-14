package io.fairspace.ceres.metadata.repository

import mu.KotlinLogging.logger
import org.apache.jena.query.*
import org.apache.jena.query.Query.*
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory.createDefaultModel
import org.apache.jena.rdf.model.RDFNode
import org.apache.jena.rdf.model.StmtIterator
import org.apache.jena.sparql.resultset.ResultSetMem
import org.apache.jena.system.Txn.*
import org.springframework.stereotype.Component
import java.net.URI
import java.net.URISyntaxException
import javax.validation.ValidationException

abstract class Enhancer {
    abstract fun enhance(iterator: StmtIterator): StmtIterator

    fun enhance(model: Model): StmtIterator = enhance(model.listStatements())
}

@Component
class ModelRepository(private val dataset: Dataset, private val enhancer: Enhancer) {

    private val log = logger {}

    fun list(subject: String? = null, predicate: String? = null, obj: String? = null): Model {
        log.trace { "Retrieving statements for s: $subject p: $predicate o: $obj" }

        return read {
            listStatements(toResource(subject), toProperty(predicate), toResource(obj)).toModel()
        }
    }

    fun add(delta: Model) {
        log.trace { "Adding statements: $delta" }
        validate(delta)
        write{ add(enhancer.enhance(delta)) }
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
        write {
            val found = listStatements(toResource(subject), toProperty(predicate), toResource(obj))
            val toRemove = enhancer.enhance(found)
            remove(toRemove)
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

        val subjectsAndPredicates = delta.listStatements().asSequence()
                .map { it.subject to it.predicate }
                .toSet()

        write {
            subjectsAndPredicates.forEach {
                val siblings = listStatements(it.first, it.second, toResource(null))
                remove(enhancer.enhance(siblings))
            }
            add(enhancer.enhance(delta))
        }
    }


    fun query(queryString: String): Any { // ResultSet | Model | Boolean
        val query = try {
            QueryFactory.create(queryString)
        } catch (_: QueryParseException) {
            badQuery(queryString)
        }

        log.trace { "Executing SPARQL: ${toSingleLine(queryString)}" }
        return read {
            QueryExecutionFactory.create(query, this).run {
                when (query.queryType) {
                    QueryTypeSelect -> execSelect().detach()
                    QueryTypeConstruct -> execConstruct().detach()
                    QueryTypeDescribe -> execDescribe().detach()
                    QueryTypeAsk -> execAsk()
                    else -> badQuery(queryString)
                }
            }
        }
    }

    private fun badQuery(queryString: String): Nothing {
        log.error { "An invalid SPARQL query: ${toSingleLine(queryString)}" }
        throw ValidationException("An invalid SPARQL query")
    }

    private fun ResultSet.detach() = ResultSetMem(this)

    private fun Model.detach() = createDefaultModel().add(this)

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

    private fun <R> read(action: Model.() -> R): R = calculateRead(dataset) { dataset.defaultModel.action() }

    private fun write(action: Model.() -> Unit): Unit = executeWrite(dataset) {
        val m = dataset.defaultModel
        m.register(modelChangedListener)
        try {
            return@executeWrite m.action()
        } finally {
            m.unregister(modelChangedListener)
        }
    }

    private fun Model.toResource(s: String?) = s?.let(this::createResource)

    private fun Model.toProperty(s: String?) = s?.let(this::createProperty)
}
