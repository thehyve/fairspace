package io.fairspace.saturn.rdf;

import org.apache.jena.query.QuerySolution;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.function.Function;

public class QuerySolutionProcessor<T> implements Consumer<QuerySolution> {
    private final List<T> values = new ArrayList<>();
    private final Function<QuerySolution, ? extends T> valueExtractor;

    public QuerySolutionProcessor(Function<QuerySolution, ? extends T> valueExtractor) {
        this.valueExtractor = valueExtractor;
    }

    @Override
    public void accept(QuerySolution querySolution) {
        values.add(valueExtractor.apply(querySolution));
    }

    public List<T> getValues() {
        return values;
    }

    public Optional<T> getSingle() {
        if (values.size() > 1) {
            throw new IllegalStateException("Too many values: " + values.size());
        }
        return values.isEmpty() ? Optional.empty() : Optional.of(values.get(0));
    }
}
