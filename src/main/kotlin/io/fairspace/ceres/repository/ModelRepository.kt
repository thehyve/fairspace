package io.fairspace.ceres.repository

import org.apache.jena.query.*
import org.apache.jena.query.Query.*
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.rdf.model.RDFNode
import org.apache.jena.reasoner.Reasoner
import org.apache.jena.sparql.resultset.ResultSetMem


class ModelRepository(private val dataset: Dataset, reasoner: Reasoner) {
    private val model = ModelFactory.createInfModel(reasoner, dataset.defaultModel)

    fun list(subject: String?, predicate: String?): Model =
            read {
                listStatements(subject?.let(::createResource), predicate?.let(::createProperty), null as RDFNode?)
                        .toModel()
            }

    fun add(delta: Model) {
        write { add(delta) }
    }

    fun remove(subject: String?, predicate: String?) {
        write {
            removeAll(subject?.let(::createResource), predicate?.let(::createProperty), null)
        }
    }

    fun query(queryString: String): Any = // ResultSet | Model | Boolean
            read {
                QueryExecutionFactory.create(QueryFactory.create(queryString), this).run {
                    when (query.queryType) {
                        QueryTypeSelect -> ResultSetMem(execSelect())
                        QueryTypeConstruct -> execConstruct()
                        QueryTypeDescribe -> execDescribe()
                        QueryTypeAsk -> execAsk()
                        else -> throw IllegalArgumentException("Cannot parse query: $queryString")
                    }
                }
            }

    fun update(delta: Model) {
        write {
            delta.listStatements().forEach { stmt ->
                if (!containsResource(stmt.subject)) {
                    throw IllegalArgumentException(stmt.subject.uri)
                }
                removeAll(stmt.subject, stmt.predicate, null)
            }
            add(delta)
        }
    }

    private fun <R> read(action: Model.() -> R): R {
        dataset.begin(ReadWrite.READ)
        try {
            return action(model)
        } finally {
            dataset.end()
        }
    }

    private fun write(action: Model.() -> Unit) {
        dataset.begin(ReadWrite.WRITE)
        try {
            action(model)
            dataset.commit()
        } catch (e: Exception) {
            dataset.abort()
            throw e
        }
    }
}
