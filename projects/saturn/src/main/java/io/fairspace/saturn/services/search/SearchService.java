package io.fairspace.saturn.services.search;

import io.fairspace.saturn.vocabulary.FS;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.*;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Resource;

import java.util.ArrayList;

import static java.util.Optional.ofNullable;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStringLiteral;
import static org.apache.jena.system.Txn.calculateRead;

@Slf4j
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
            }
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
            }
            """, FS.NS));

    private final Dataset ds;

    public SearchService(Dataset ds) {
        this.ds = ds;
    }

    public SearchResultsDTO getFileSearchResults(FileSearchRequest request) {
        return SearchResultsDTO.builder()
                .results(getFilesByText(request))
                .query(request.getQuery())
                .build();
    }

    public SearchResultsDTO getLookupSearchResults(LookupSearchRequest request) {
        return SearchResultsDTO.builder()
                .results(getResourceByText(request))
                .query(request.getQuery())
                .build();
    }

    private ArrayList<SearchResultDTO> getFilesByText(FileSearchRequest request) {
        var query = getSearchForFilesQuery(request.getParentIRI());
        var binding = new QuerySolutionMap();
        binding.add("regexQuery", createStringLiteral(getQueryRegex(request.getQuery())));
        return getByQuery(query, binding);
    }

    private ArrayList<SearchResultDTO> getResourceByText(LookupSearchRequest request) {
        var binding = new QuerySolutionMap();
        binding.add("query", createStringLiteral(request.getQuery()));
        binding.add("type", createResource(request.getResourceType()));

        var results = getByQuery(RESOURCE_BY_TEXT_EXACT_MATCH_QUERY, binding);
        if (results.size() > 0) {
            return results;
        }

        binding.add("regexQuery", createStringLiteral(getQueryRegex(request.getQuery())));
        return getByQuery(RESOURCE_BY_TEXT_QUERY, binding);
    }

    private ArrayList<SearchResultDTO> getByQuery(Query query, QuerySolutionMap binding) {
        log.debug("Executing query:\n{}", query);
        var selectExecution = QueryExecutionFactory.create(query, ds, binding);
        var results = new ArrayList<SearchResultDTO>();

        return calculateRead(ds, () -> {
            try (selectExecution) {
                //noinspection NullableProblems
                for (var row : (Iterable<QuerySolution>) selectExecution::execSelect) {
                    var id = row.getResource("id").getURI();
                    var label = row.getLiteral("label").getString();
                    var type = ofNullable(row.getResource("type")).map(Resource::getURI).orElse(null);
                    var comment = ofNullable(row.getLiteral("comment")).map(Literal::getString).orElse(null);
                    results.add(new SearchResultDTO(id, label, type, comment));
                }
            }
            return results;
        });
    }

    private Query getSearchForFilesQuery(String parentIRI) {
        var builder = new StringBuilder("PREFIX fs: <")
                .append(FS.NS)
                .append(">\nPREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n\n")
                .append("SELECT ?id ?label ?comment ?type\n")
                .append("WHERE {\n");

        if (parentIRI != null && !parentIRI.trim().isEmpty()) {
            builder.append("?id fs:belongsTo* <").append(parentIRI).append("> .\n");
        }

        builder.append("?id rdfs:label ?label ; a ?type .\n")
                .append("FILTER (?type in (fs:File, fs:Directory, fs:Collection))\n")
                .append("OPTIONAL { ?id rdfs:comment ?comment }\n")
                .append("FILTER NOT EXISTS { ?id fs:dateDeleted ?anydate }\n")
                .append("FILTER (regex(?label, ?regexQuery, \"i\") || regex(?comment, ?regexQuery, \"i\"))\n")
                .append("}\nLIMIT 10000");

        return QueryFactory.create(builder.toString());
    }

    private String getQueryRegex(String query) {
        return ("(^|\\s|\\.|\\-|\\,|\\;|\\(|\\[|\\{|\\?|\\!|\\\\|\\/|_)"
                + query.replaceAll("[^a-zA-Z0-9]", "\\\\$0"))
                .replace("/\\/g", "\\\\");
    }
}
