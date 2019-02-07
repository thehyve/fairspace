package io.fairspace.saturn.sparqlunit;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.update.UpdateExecutionFactory;
import org.apache.jena.update.UpdateFactory;

import java.util.function.Predicate;

import static org.junit.Assert.assertTrue;

/**
 * A simple unit-testing DSL for SPARQL
 */
public class SparqlUnit {
    private final Dataset dataset;

    private SparqlUnit(Dataset dataset) {
        this.dataset = dataset;
    }

   public SparqlUnit given() {
        return given(DatasetFactory.create());
   }

    public static SparqlUnit given(Model model) {
        return given(DatasetFactory.create(model));
    }

    public static SparqlUnit given(Dataset ds) {
        return new SparqlUnit(ds);
    }

    public SparqlUnit update(String updateQuery) {
        UpdateExecutionFactory.create(UpdateFactory.create(updateQuery), dataset).execute();
        return this;
    }

    public SparqlUnit testDataset(Predicate<Dataset> condition) {
        assertTrue(condition.test(dataset));
        return this;
    }

    public SparqlUnit testModel(Predicate<Model> condition) {
        assertTrue(condition.test(dataset.getDefaultModel()));
        return this;
    }

    public SparqlUnit testAsk(String ask) {
        assertTrue(QueryExecutionFactory.create(ask, dataset).execAsk());
        return this;
    }

    public SparqlUnit testSelect(String select, Predicate<ResultSet> condition) {
        assertTrue(condition.test(QueryExecutionFactory.create(select, dataset).execSelect()));
        return this;
    }

    public SparqlUnit testConstruct(String construct, Predicate<Model> condition) {
        assertTrue(condition.test(QueryExecutionFactory.create(construct, dataset).execConstruct()));
        return this;
    }

    public SparqlUnit testDescribe(String describe, Predicate<Model> condition) {
        assertTrue(condition.test(QueryExecutionFactory.create(describe, dataset).execDescribe()));
        return this;
    }
}
