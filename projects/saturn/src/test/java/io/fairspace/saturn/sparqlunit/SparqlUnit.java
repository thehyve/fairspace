package io.fairspace.saturn.sparqlunit;

import java.util.function.Consumer;

import org.apache.jena.query.*;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.update.UpdateExecutionFactory;
import org.apache.jena.update.UpdateFactory;

import static org.junit.Assert.assertTrue;

/**
 * A simple unit-testing DSL for SPARQL
 */
public class SparqlUnit {
    private final Dataset dataset;

    private SparqlUnit(Dataset dataset) {
        this.dataset = dataset;
    }

    public static SparqlUnit given() {
        return given(DatasetFactory.create());
    }

    public static SparqlUnit given(Model model) {
        return given(DatasetFactory.create(model));
    }

    public static SparqlUnit given(Dataset ds) {
        return new SparqlUnit(ds);
    }

    public SparqlUnit update(String updateQuery) {
        UpdateExecutionFactory.create(UpdateFactory.create(updateQuery), dataset)
                .execute();
        return this;
    }

    public SparqlUnit testDataset(Consumer<Dataset> assertions) {
        assertions.accept(dataset);
        return this;
    }

    public SparqlUnit testModel(Consumer<Model> assertions) {
        assertions.accept(dataset.getDefaultModel());
        return this;
    }

    public SparqlUnit testAsk(String ask) {
        assertTrue(query(ask).execAsk());
        return this;
    }

    public SparqlUnit testSelect(String select, Consumer<ResultSet> assertions) {
        assertions.accept(query(select).execSelect());
        return this;
    }

    public SparqlUnit testConstruct(String construct, Consumer<Model> assertions) {
        assertions.accept(query(construct).execConstruct());
        return this;
    }

    public SparqlUnit testDescribe(String describe, Consumer<Model> assertions) {
        assertions.accept(query(describe).execDescribe());
        return this;
    }

    private QueryExecution query(String q) {
        return QueryExecutionFactory.create(q, dataset);
    }
}
