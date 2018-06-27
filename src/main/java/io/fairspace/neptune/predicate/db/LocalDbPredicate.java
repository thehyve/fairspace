package io.fairspace.neptune.predicate.db;

import io.fairspace.neptune.business.PredicateInfo;

import java.net.URI;
import java.util.List;

public class LocalDbPredicate extends PredicateInfo {

    private List<URI> alternatives;

    public LocalDbPredicate(String label, URI uri, List<URI> alternatives) {
        super(label, uri);
        this.alternatives = alternatives;
    }

    public List<URI> getAlternatives() {
        return alternatives;
    }

    public void setAlternatives(List<URI> alternatives) {
        this.alternatives = alternatives;
    }

}
