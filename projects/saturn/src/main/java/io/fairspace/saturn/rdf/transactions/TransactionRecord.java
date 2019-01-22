package io.fairspace.saturn.rdf.transactions;

import lombok.Data;
import org.apache.jena.sparql.core.Quad;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class TransactionRecord implements Serializable {
    private static final long serialVersionUID = 1L;

    private long startTimestamp;

    private long commitTimestamp;

    private String userId;

    private String userName;

    private String commitMessage;

    private final List<Quad> added = new ArrayList<>();

    private final List<Quad> deleted = new ArrayList<>();
}
