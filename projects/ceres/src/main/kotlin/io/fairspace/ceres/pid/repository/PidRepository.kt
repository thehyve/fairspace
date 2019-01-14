package io.fairspace.ceres.pid.repository

import io.fairspace.ceres.pid.model.Pid
import io.fairspace.ceres.pid.service.PidConverter
import org.apache.jena.query.*
import org.apache.jena.rdf.model.RDFNode
import org.apache.jena.rdf.model.ResourceFactory.createProperty
import org.apache.jena.rdf.model.ResourceFactory.createStringLiteral
import org.apache.jena.sparql.resultset.ResultSetMem
import org.apache.jena.system.Txn.*
import org.springframework.stereotype.Component
import java.util.*

@Component
class PidRepository(private val ds: Dataset, private val pidConverter: PidConverter) {
    private val FILE_PATH = createProperty("http://fairspace.io/ontology#filePath")

    fun findByValue(value: String): Pid? = calculateRead(ds) {
        ds.defaultModel.listStatements(null, FILE_PATH, value)
                .asSequence()
                .map { Pid(pidConverter.idToUUID(it.subject.uri), it.`object`.asLiteral().string) }
                .firstOrNull()
    }

    fun findByValueStartingWith(prefix: String): List<Pid> {

            val pss = ParameterizedSparqlString("SELECT *\n" +
                    "WHERE\n" +
                    "{\n" +
                    "  ?s <http://fairspace.io/ontology#filePath> ?o .\n" +
                    "  FILTER (STRSTARTS(?o, ?prefix))\n" +
                    "}")
            pss.setLiteral("prefix", prefix)

            val query =
                QueryFactory.create(pss.toString())

           return calculateRead(ds) {
               QueryExecutionFactory.create(query, ds.defaultModel).execSelect()
                       .asSequence()
                       .map { Pid(pidConverter.idToUUID(it["s"].asResource().uri), it["o"].asLiteral().string) }
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
            val pss = ParameterizedSparqlString("SELECT *\n" +
                    "WHERE\n" +
                    "{\n" +
                    "  ?s <http://fairspace.io/ontology#filePath> ?o .\n" +
                    "  FILTER (STRSTARTS(?o, ?prefix))\n" +
                    "}")
            pss.setLiteral("prefix", prefix)

            val query =
                    QueryFactory.create(pss.toString())

            val toDelete = ResultSetMem(QueryExecutionFactory.create(query, ds.defaultModel).execSelect())
            toDelete.forEachRemaining {
                ds.defaultModel.removeAll(it["s"].asResource(), FILE_PATH, it["o"])
            }
        }
    }

    fun findById(uuid: UUID): Pid? =
            calculateRead(ds) {
                ds.defaultModel
                        .getResource(pidConverter.uuidToId(uuid))
                        ?.getProperty(FILE_PATH)?.`object`
                        ?.asLiteral()
                        ?.string
                        ?.let { Pid(uuid, it) }
            }

    fun saveAll(pids: List<Pid>): List<Pid> =
            calculateWrite(ds) { pids.map { save(it) } }

    fun deleteById(uuid: UUID) {
        executeWrite(ds) {
            val res = ds.defaultModel.getResource(pidConverter.uuidToId(uuid))
            ds.defaultModel.removeAll(res, null, null)
        }
    }

    fun save(pid: Pid?): Pid {
        val res = ds.defaultModel.getResource(pidConverter.uuidToId(pid!!.uuid))
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
                        .map { Pid(pidConverter.idToUUID(it.subject.uri), it.`object`.asLiteral().string) }
                        .toList()
            }

}

