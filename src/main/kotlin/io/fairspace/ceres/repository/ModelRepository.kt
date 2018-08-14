package io.fairspace.ceres.repository

import org.apache.jena.query.*
import org.apache.jena.query.Query.*
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.RDFNode
import org.apache.jena.sparql.resultset.ResultSetMem


class ModelRepository(private val dataset: Dataset) {

    fun list(subject: String?, predicate: String?): Model =
            dataset.read {
                listStatements(subject?.let(::createResource), predicate?.let(::createProperty), null as RDFNode?)
                        .toModel()
            }

    fun add(delta: Model) {
        dataset.write { add(delta) }
    }

    fun remove(subject: String?, predicate: String?) {
        dataset.write {
            removeAll(subject?.let(::createResource), predicate?.let(::createProperty), null)
        }
    }

    fun query(queryString: String): Any = // ResultSet | Model | Boolean
        dataset.read {
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
        dataset.write {
            delta.listStatements().forEach { stmt ->
                if (!containsResource(stmt.subject)) {
                    throw IllegalArgumentException(stmt.subject.uri)
                }
                removeAll(stmt.subject, stmt.predicate, null)
            }
            add(delta)
        }
    }
}
