package io.fairspace.ceres.metadata.service

import io.fairspace.ceres.metadata.repository.ModelRepository
import org.apache.jena.query.ParameterizedSparqlString
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.rdf.model.ModelFactory.createDefaultModel
import org.springframework.stereotype.Component

@Component
class MetadataService(val modelRepository: ModelRepository) {
    companion object {
        const val QUERY_ALL_METADATA_FOR_RESOURCES = """
        CONSTRUCT {?s ?p ?t}
        WHERE {
            { ?s ?p ?t FILTER(?s in (%s))}
        }
    """

        const val LIST_STATEMENTS_WITH_OBJECT_LABELS_QUERY = """
        PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
        CONSTRUCT {?s ?p ?o . ?o rdfs:label ?l}
        WHERE {
          { ?s ?p ?o }
          OPTIONAL { ?o rdfs:label ?l}
        }
    """
    }

    fun getMetadataForResources(resources: Collection<String>): Model {
        if(resources.isEmpty()) {
            return createDefaultModel()
        }

        val query = QUERY_ALL_METADATA_FOR_RESOURCES.format(resources.joinToString(",") {"<$it>"})

        return modelRepository.query(query) as Model
    }


    fun getStatementsWithObjectLabels(subject: String?, predicate: String? = null, obj: String? = null): Model {
        val query = ParameterizedSparqlString(LIST_STATEMENTS_WITH_OBJECT_LABELS_QUERY)

        subject?.let { query.setIri("s", it) }
        predicate?.let { query.setIri("p", it) }
        obj?.let { query.setIri("o", obj) }

        return modelRepository.query(query.toString()) as Model
    }
}
