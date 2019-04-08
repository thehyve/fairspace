package io.fairspace.saturn.services.metadata;

import org.apache.jena.rdf.model.Model;

import java.util.function.Function;
import java.util.stream.Stream;

public class MergingReadableMetadataService implements MetadataSource {
    private final MetadataSource[] sources;

    public MergingReadableMetadataService(MetadataSource... sources) {
        this.sources = sources;
    }

    @Override
    public Model get(String subject, String predicate, String object, boolean withLabels) {
        return merge(child -> child.get(subject, predicate, object, withLabels));
    }

    @Override
    public Model getByType(String type) {
        return merge(child -> child.getByType(type));
    }

    private Model merge(Function<MetadataSource, Model> action) {
        return Stream.of(sources)
                .map(action)
                .reduce(Model::add)
                .get();
    }
}
