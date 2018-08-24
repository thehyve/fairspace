package io.fairspace.ceres.repository

import org.apache.jena.query.*
import org.apache.jena.query.Query.*
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.rdf.model.RDFNode
import org.apache.jena.reasoner.ReasonerRegistry
import org.apache.jena.sparql.resultset.ResultSetMem
import org.apache.jena.util.FileManager


class ModelRepository(private val dataset: Dataset) {
    // Create a single instance of a reasoner to do inference
    val reasoner = ReasonerRegistry.getOWLReasoner().bindSchema(FileManager.get().loadModel("inference-model.jsonld"))

    fun list(model: String, subject: String?, predicate: String?): Model =
            dataset.read(model) {
                listStatements(subject?.let(::createResource), predicate?.let(::createProperty), null as RDFNode?)
                        .toModel()
            }

    fun listWithReasoning(model: String, subject: String?, predicate: String?): Model =
            dataset.read(model) {
                ModelFactory.createInfModel(reasoner, this)
                        .listStatements(subject?.let(::createResource), predicate?.let(::createProperty), null as RDFNode?)
                        .toModel()
            }


    fun add(model: String, delta: Model) {
        dataset.write(model) { add(delta) }
    }

    fun remove(model: String, subject: String?, predicate: String?) {
        dataset.write(model) {
            removeAll(subject?.let(::createResource), predicate?.let(::createProperty), null)
        }
    }

    fun query(model: String, queryString: String): Any = // ResultSet | Model | Boolean
        dataset.read(model) {
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

    fun update(model: String, delta: Model) {
        dataset.write(model) {
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