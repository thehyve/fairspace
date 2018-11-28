package io.fairspace.ceres.metadata.service

import io.fairspace.ceres.metadata.repository.ModelRepository
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.ModelFactory
import org.springframework.stereotype.Component

@Component
class MetadataService(val modelRepository: ModelRepository) {
    val QUERY_ALL_METADATA_FOR_RESOURCES = """
        CONSTRUCT {?s ?p ?t}
        WHERE {
            { ?s ?p ?t FILTER(?s in (%s))}
        }
    """

    val LIST_STATEMENTS_WITH_OBJECT_LABELS_QUERY = """
        PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>
        CONSTRUCT {?s ?p ?o . ?o rdfs:label ?l}
        WHERE {
          { ?s ?p ?o }
          OPTIONAL { ?o rdfs:label ?l}
        }
    """

    fun getMetadataForResources(resources: Collection<String>): Model {
        if(resources.isEmpty()) {
            return ModelFactory.createDefaultModel()
        }

        val query= QUERY_ALL_METADATA_FOR_RESOURCES
                .format(resources.map {"<$it>"}.joinToString(","))

        return modelRepository.query(query) as Model
    }


    fun getStatementsWithObjectLabels(subject: String?, predicate: String? = null, obj: String? = null): Model {
        var query= LIST_STATEMENTS_WITH_OBJECT_LABELS_QUERY

        subject?.let { query = query.replace("?s", "<$subject>") }
        predicate?.let { query = query.replace("?p", "<$predicate>") }
        obj?.let { query = query.replace("?o", "<$obj>") }

        return modelRepository.query(query) as Model
    }
}
