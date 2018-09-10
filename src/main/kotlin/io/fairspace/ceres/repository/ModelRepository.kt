package io.fairspace.ceres.repository

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
import java.util.concurrent.locks.ReentrantReadWriteLock
import kotlin.concurrent.read
import kotlin.concurrent.write

class ModelRepository(private val dataset: Dataset, reasoner: Reasoner) {
    private val lock = ReentrantReadWriteLock()
    private val model = ModelFactory.createInfModel(reasoner, dataset.defaultModel)

    fun list(subject: String?, predicate: String?, obj: String?): Model =
            read {
                listStatements(subject?.let(::createResource), predicate?.let(::createProperty), obj?.let(::createResource))
                        .toModel()
            }

    fun add(delta: Model) {
        write { add(delta) }
    }

    fun remove(subject: String?, predicate: String? = null) {
        write {
            removeAll(subject?.let(::createResource), predicate?.let(::createProperty), null)
        }
    }

    fun query(queryString: String): Any = // ResultSet | Model | Boolean
            read {
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

    fun update(delta: Model) {
        write {
            delta.listStatements().forEach {
                removeAll(it.subject, it.predicate, null)
            }
            add(delta)
        }
    }

    private fun <R> read(action: Model.() -> R): R = lock.read {
         Txn.calculateRead(dataset) { action(model) }
    }

    private fun write(action: Model.() -> Unit) = lock.write {
        Txn.executeWrite(dataset) { action(model) }
    }

    private fun ResultSet.detach() = ResultSetMem(this)
    private fun Model.detach() = ModelFactory.createDefaultModel().add(this)
}
