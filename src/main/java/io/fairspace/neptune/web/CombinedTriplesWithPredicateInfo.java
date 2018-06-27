package io.fairspace.neptune.web;

import io.fairspace.neptune.business.PredicateInfo;
import io.fairspace.neptune.business.Triple;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CombinedTriplesWithPredicateInfo {

    private List<Triple> triples;
    private List<PredicateInfo> predicateInfo;

}
