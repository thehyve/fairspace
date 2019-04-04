package io.fairspace.saturn.services.metadata.validation;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;

public class InversionUtils {
    /**
     * @param rdf
     * @param changes
     * @return resources affected by changes taking inversion into account
     */
    public static Set<Resource> getAffectedResources(RDFConnection rdf, Model changes) {
        var inverse = getInverseProperties(rdf);

        var resources = new HashSet<Resource>();

        changes.listStatements()
                .forEachRemaining(stmt -> {
                            resources.add(stmt.getSubject());

                            if (inverse.containsKey(stmt.getPredicate()) && stmt.getObject().isResource()) {
                                resources.add(stmt.getResource());
                            }
                        }
                );

        return resources;
    }

    /**
     * @param rdf
     * @return A property-to-property map of inverse properties from the user vocabulary
     */
    public static Map<Property, Property> getInverseProperties(RDFConnection rdf) {
        var result = new HashMap<Property, Property>();
        rdf.querySelect(storedQuery("inverse_properties"), row -> {
            var lhs = createProperty(row.getResource("lhs").getURI());
            var rhs = createProperty(row.getResource("rhs").getURI());
            result.put(lhs, rhs);
            result.put(rhs, lhs);
        });
        return result;
    }
}
