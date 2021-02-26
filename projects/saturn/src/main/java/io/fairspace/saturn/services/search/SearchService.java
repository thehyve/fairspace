package io.fairspace.saturn.services.search;

import io.fairspace.saturn.vocabulary.FS;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.*;
import org.apache.jena.rdf.model.Literal;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static java.util.Optional.ofNullable;
import static org.apache.jena.system.Txn.calculateRead;

@Slf4j
public class SearchService {
    private final Dataset ds;
    private final List<String> fileResourceTypes = Arrays.asList("fs:File", "fs:Directory", "fs:Collection");

    public SearchService(Dataset ds) {
        this.ds = ds;
    }

    public SearchResultsDTO getSearchResults(SearchRequest request) {
        List<SearchResultDTO> results = new ArrayList<>();
        if (fileResourceTypes.contains(request.getResourceType())) {
            results.addAll(getFilesByText(request));
        } else {
            results.addAll(getResourceByText(request));
        }
        return SearchResultsDTO.builder()
                .results(results)
                .parentIRI(request.getParentIRI())
                .query(request.getQuery())
                .build();
    }

    private ArrayList<SearchResultDTO> getFilesByText(SearchRequest request) {
        var query = getSearchForFilesQuery(request.getQuery(), request.getParentIRI());
        return getByQuery(query);
    }

    private ArrayList<SearchResultDTO> getResourceByText(SearchRequest request) {
        var exactMatchQuery = getSearchForResourcesExactMatchQuery(request.getQuery(), request.getResourceType());
        var results = getByQuery(exactMatchQuery);

        if (results.size() > 0) {
            return results;
        }

        var regexQuery = getSearchForResourcesQuery(request.getQuery(), request.getResourceType());
        return getByQuery(regexQuery);
    }

    private ArrayList<SearchResultDTO> getByQuery(Query query) {
        log.debug("Executing query:\n{}", query);
        var selectExecution = QueryExecutionFactory.create(query, ds);
        var results = new ArrayList<SearchResultDTO>();

        return calculateRead(ds, () -> {
            try (selectExecution) {
                //noinspection NullableProblems
                for (var row : (Iterable<QuerySolution>) selectExecution::execSelect) {
                    var id = row.getResource("id").getURI();
                    var label = row.getLiteral("label").getString();
                    var type = row.getResource("type").getURI();
                    var comment = ofNullable(row.getLiteral("comment")).map(Literal::getString).orElse(null);
                    results.add(new SearchResultDTO(id, label, type, comment));
                }
            }
            return results;
        });
    }


    private Query getSearchForFilesQuery(String query, String parentIRI) {
        var regexQuery = getQueryRegex(query);
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
                .append("FILTER (regex(?label, \"")
                .append(regexQuery)
                .append("\", \"i\") || regex(?comment, \"")
                .append(regexQuery)
                .append("\", \"i\"))\n")
                .append("}\nLIMIT 10000");

        return QueryFactory.create(builder.toString());
    }

    private Query getSearchForResourcesQuery(String query, String type) {
        return QueryFactory.create(String.format("""
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX fs: <%1$s>
            
            SELECT ?id ?label ?comment
            WHERE {
                ?id a <%2$s> ;
                    rdfs:label ?label .
                OPTIONAL { ?id rdfs:comment ?comment }
                FILTER NOT EXISTS { ?id fs:dateDeleted ?anydate }
                FILTER (regex(?label, "%3$s", "i") || regex(?comment, "$%3$s", "i"))
            }
            LIMIT 20    
            """, FS.NS, type, getQueryRegex(query)));
    }

    private Query getSearchForResourcesExactMatchQuery(String query, String type) {
        return QueryFactory.create(String.format("""
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX fs: <%1$s>
            
            SELECT ?id ?label ?comment
            WHERE {
                BIND(%2$s AS ?label)    
                ?id rdfs:label ?label; a <%3$s> .
                OPTIONAL { ?id rdfs:comment ?comment }
                FILTER NOT EXISTS { ?id fs:dateDeleted ?anydate }
            }           
            """, FS.NS, query, type));
    }

    private String getQueryRegex(String query) {
        return ("(^|\\\\s|\\\\.|\\\\-|\\\\,|\\\\;|\\\\(|\\\\[|\\\\{|\\\\?|\\\\!|\\\\\\\\|\\\\/|_)"
                + query.replaceAll("[^a-zA-Z0-9]", "\\\\\\\\$0"))
                .replace("/\\/g", "\\\\");
    }

}
