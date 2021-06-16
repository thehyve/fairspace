package io.fairspace.saturn.services.search;

import io.fairspace.saturn.rdf.SparqlUtils;
import io.fairspace.saturn.services.views.QueryService;
import io.fairspace.saturn.services.views.SparqlQueryService;
import io.fairspace.saturn.vocabulary.FS;
import lombok.extern.log4j.*;
import org.apache.jena.query.*;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Resource;

import java.util.ArrayList;
import java.util.List;

import static java.util.Optional.ofNullable;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStringLiteral;
import static org.apache.jena.system.Txn.calculateRead;

@Log4j2
public class SearchService {
    private static final Query RESOURCE_BY_TEXT_QUERY = QueryFactory.create(String.format("""
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX fs: <%1$s>

            SELECT ?id ?label ?comment
            WHERE {
                ?id a ?type ; rdfs:label ?label .
                OPTIONAL { ?id rdfs:comment ?comment }
                FILTER NOT EXISTS { ?id fs:dateDeleted ?anydate }
                FILTER (regex(?label, ?regexQuery, "i") || regex(?comment, ?regexQuery, "i"))
            } ORDER BY ?label
            LIMIT 20
            """, FS.NS));

    private static final Query RESOURCE_BY_TEXT_EXACT_MATCH_QUERY = QueryFactory.create(String.format("""
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX fs: <%1$s>

            SELECT ?id ?label ?comment
            WHERE {
                BIND(?query AS ?label)
                ?id rdfs:label ?label; a ?type .
                OPTIONAL { ?id rdfs:comment ?comment }
                FILTER NOT EXISTS { ?id fs:dateDeleted ?anydate }
            } ORDER BY ?label
            """, FS.NS));

    private final Dataset ds;

    public SearchService(Dataset ds) {
        this.ds = ds;
    }

    public SearchResultsDTO getLookupSearchResults(LookupSearchRequest request) {
        return SearchResultsDTO.builder()
                .results(getResourceByText(request))
                .query(request.getQuery())
                .build();
    }

    private List<SearchResultDTO> getResourceByText(LookupSearchRequest request) {
        var binding = new QuerySolutionMap();
        binding.add("query", createStringLiteral(request.getQuery()));
        binding.add("type", createResource(request.getResourceType()));

        var results = SparqlUtils.getByQuery(RESOURCE_BY_TEXT_EXACT_MATCH_QUERY, binding, ds);
        if (results.size() > 0) {
            return results;
        }

        binding.add("regexQuery", createStringLiteral(SparqlUtils.getQueryRegex(request.getQuery())));
        return SparqlUtils.getByQuery(RESOURCE_BY_TEXT_QUERY, binding, ds);
    }
}
