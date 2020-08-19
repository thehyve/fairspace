package io.fairspace.saturn.rdf;

import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.graph.FrontsNode;
import org.apache.jena.graph.Node;
import org.apache.jena.query.*;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.update.UpdateExecutionFactory;
import org.apache.jena.update.UpdateFactory;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.function.Consumer;
import java.util.function.Function;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static java.util.UUID.randomUUID;
import static org.apache.jena.datatypes.xsd.XSDDatatype.XSDlong;
import static org.apache.jena.graph.NodeFactory.createLiteral;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;
import static org.apache.jena.riot.out.NodeFmtLib.str;
import static org.apache.jena.system.Txn.*;


public class SparqlUtils {
    public static Node generateMetadataIri() {
        return generateMetadataIri(randomUUID().toString());
    }

    public static Node generateMetadataIri(String id) {
        return createURI(CONFIG.jena.metadataBaseIRI + id);
    }

    public static Instant parseXSDDateTimeLiteral(Literal literal) {
        return Instant.ofEpochMilli(((XSDDateTime) literal.getValue()).asCalendar().getTimeInMillis());
    }

    public static Literal toXSDDateTimeLiteral(Instant instant) {
        return createTypedLiteral(GregorianCalendar.from(ZonedDateTime.ofInstant(instant, ZoneId.systemDefault())));
    }

    private static String toString(Object value) {
        return str(toNode(value));
    }

    private static Node toNode(Object value) {
        if (value instanceof Node) {
            return (Node) value;
        }
        if (value instanceof FrontsNode) {
            return ((FrontsNode) value).asNode();
        }
        if (value instanceof String) {
            return createLiteral((String) value);
        }
        if (value instanceof Long) {
            return createTypedLiteral(value.toString(), XSDlong).asNode();
        }
        return createTypedLiteral(value instanceof Instant ? toCalendar((Instant) value) : value).asNode();
    }

    private static Calendar toCalendar(Instant value) {
        return GregorianCalendar.from(ZonedDateTime.ofInstant(value, ZoneId.systemDefault()));
    }

    public static <T> List<T> select(Dataset dataset, String query, Function<QuerySolution, T> valueExtractor) {
        var values = new ArrayList<T>();
        querySelect(dataset, query, row -> values.add(valueExtractor.apply(row)));
        return values;
    }

    public static <T> Set<T> selectDistinct(Dataset dataset, String query, Function<QuerySolution, T> valueExtractor) {
        var values = new HashSet<T>();
        querySelect(dataset, query, row -> values.add(valueExtractor.apply(row)));
        return values;
    }

    public static <T> Optional<T> selectSingle(Dataset dataset, String query, Function<QuerySolution, T> valueExtractor) {
        var values = selectDistinct(dataset, query, valueExtractor);
        if (values.size() > 1) {
            throw new IllegalStateException("Too many values: " + values.size());
        }
        return values.stream().findFirst();
    }

    /**
     * Execute a SELECT query and process the ResultSet with the handler code.
     *
     * @param query
     * @param resultSetAction
     */
    public static void queryResultSet(Dataset dataset, String query, Consumer<ResultSet> resultSetAction) {
        executeRead(dataset, () -> {
            try (var qExec = query(dataset, query)) {
                ResultSet rs = qExec.execSelect();
                resultSetAction.accept(rs);
            }
        });
    }


    /**
     * Execute a SELECT query and process the rows of the results with the handler code.
     *
     * @param query
     * @param rowAction
     */
    public static void querySelect(Dataset dataset, String query, Consumer<QuerySolution> rowAction) {
        executeRead(dataset, () -> {
            try (var qExec = query(dataset, query)) {
                qExec.execSelect().forEachRemaining(rowAction);
            }
        });
    }

    /**
     * Execute a CONSTRUCT query and return as a Model
     */
    public static Model queryConstruct(Dataset dataset, String query) {
        return calculateRead(dataset, () -> {
            try (var qExec = query(dataset, query)) {
                return detachModel(qExec.execConstruct());
            }
        });
    }

    /**
     * Execute a DESCRIBE query and return as a Model
     */
    public static Model queryDescribe(Dataset dataset, String query) {
        return calculateRead(dataset, () -> {
            try (var qExec = query(dataset, query)) {
                return detachModel(qExec.execDescribe());
            }
        });
    }

    /**
     * Execute a ASK query and return a boolean
     */
    public static boolean queryAsk(Dataset dataset, String query) {
        return calculateRead(dataset, () -> {
            try (var qExec = query(dataset, query)) {
                return qExec.execAsk();
            }
        });
    }

    public static void update(Dataset dataset, String updateString) {
        executeWrite(dataset, () -> UpdateExecutionFactory.create(UpdateFactory.create(updateString), dataset).execute());
    }

    public static Model detachModel(Model m) {
        return createDefaultModel().add(m);
    }

    private static QueryExecution query(Dataset dataset, String query) {
        return QueryExecutionFactory.create(QueryFactory.create(query), dataset);
    }

}
