package io.fairspace.ceres.pid.repository

import io.fairspace.ceres.pid.model.Pid
import org.apache.jena.query.*
import org.apache.jena.rdf.model.RDFNode
import org.apache.jena.rdf.model.ResourceFactory.createProperty
import org.apache.jena.rdf.model.ResourceFactory.createStringLiteral
import org.apache.jena.sparql.resultset.ResultSetMem
import org.apache.jena.system.Txn.*
import org.springframework.stereotype.Component

@Component
class PidRepository(private val ds: Dataset) {
    private val FILE_PATH = createProperty("http://fairspace.io/ontology#filePath")

    fun findByValue(value: String): Pid? = calculateRead(ds) {
        ds.defaultModel.listStatements(null, FILE_PATH, value)
                .asSequence()
                .map { Pid(it.subject.uri, it.`object`.asLiteral().string) }
                .firstOrNull()
    }

    fun findByValueStartingWith(prefix: String): List<Pid> {
        return calculateRead(ds) {
            queryByPrefix(prefix)
                    .asSequence()
                    .map { Pid(it["s"].asResource().uri, it["o"].asLiteral().string) }
                    .toList()
        }
    }

    fun deleteByValue(value: String) {
        executeWrite(ds) {
            ds.defaultModel.removeAll(null, FILE_PATH, createStringLiteral(value))
        }
    }

    fun deleteByValueStartingWith(prefix: String) {
        executeWrite(ds) {
            ResultSetMem(queryByPrefix(prefix)).forEachRemaining {
                ds.defaultModel.removeAll(it["s"].asResource(), FILE_PATH, it["o"])
            }
        }
    }

    private fun queryByPrefix(prefix: String): ResultSet {
        val query = QueryFactory.create(ParameterizedSparqlString("""
            SELECT *
            WHERE
            {
              ?s <http://fairspace.io/ontology#filePath> ?o .
              FILTER (STRSTARTS(?o, CONCAT(?prefix, "/")) || (?o = ?prefix))
            }""")
                .apply { setLiteral("prefix", prefix) }
                .toString())

        return QueryExecutionFactory.create(query, ds.defaultModel).execSelect()
    }

    fun findById(id: String): Pid? =
            calculateRead(ds) {
                ds.defaultModel
                        .getResource(id)
                        ?.getProperty(FILE_PATH)?.`object`
                        ?.asLiteral()
                        ?.string
                        ?.let { Pid(id, it) }
            }

    fun saveAll(pids: List<Pid>): List<Pid> =
            calculateWrite(ds) { pids.map(this::save) }

    fun deleteById(id: String) {
        executeWrite(ds) {
            val res = ds.defaultModel.getResource(id)
            ds.defaultModel.removeAll(res, null, null)
        }
    }

    fun save(pid: Pid?): Pid {
        val res = ds.defaultModel.getResource(pid!!.id)
        calculateWrite(ds) {
            ds.defaultModel.removeAll(res, FILE_PATH, null)
                    .add(res, FILE_PATH, pid.value)
        }
        return pid
    }

    fun findAll(): List<Pid> =
            calculateRead(ds) {
                ds.defaultModel.listStatements(null, FILE_PATH, null as RDFNode?)
                        .asSequence()
                        .map { Pid(it.subject.uri, it.`object`.asLiteral().string) }
                        .toList()
            }

}

