package io.fairspace.ceres.repository

import org.apache.jena.query.*
import org.apache.jena.query.Query.*
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.rdf.model.RDFNode
import org.apache.jena.reasoner.Reasoner
import org.apache.jena.sparql.resultset.ResultSetMem
import org.apache.jena.system.Txn

open class ModelRepository(private val dataset: Dataset, reasoner: Reasoner) {
    private val model = ModelFactory.createInfModel(reasoner, dataset.defaultModel)

    open fun list(subject: String?, predicate: String? = null): Model =
            read {
                listStatements(subject?.let(::createResource), predicate?.let(::createProperty), null as RDFNode?)
                        .toModel()
            }

    open fun add(delta: Model) {
        write { add(delta) }
    }

    open fun remove(subject: String?, predicate: String? = null) {
        write {
            removeAll(subject?.let(::createResource), predicate?.let(::createProperty), null)
        }
    }

    open fun query(queryString: String): Any = // ResultSet | Model | Boolean
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

    open fun update(delta: Model) {
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

    private fun <R> read(action: Model.() -> R): R = Txn.calculateRead(dataset) { action(model) }

    private fun write(action: Model.() -> Unit) {
        Txn.executeWrite(dataset) { action(model) }
    }
}
