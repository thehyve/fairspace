package io.fairspace.neptune.web;

import io.fairspace.neptune.model.PredicateInfo;
import io.fairspace.neptune.model.Triple;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CombinedTriplesWithPredicateInfo {

    private List<Triple> triples;
    private List<PredicateInfo> predicateInfo;

}
