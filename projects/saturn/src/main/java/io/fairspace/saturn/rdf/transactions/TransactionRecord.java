package io.fairspace.saturn.rdf.transactions;

import lombok.Data;
import org.apache.commons.io.output.ByteArrayOutputStream;
import org.apache.jena.sparql.core.Quad;

import java.io.IOException;
import java.io.Serializable;
import java.util.Set;

@Data
public class TransactionRecord implements Serializable {
    private static final long serialVersionUID = 1L;

    private long timestamp;

    private String userId;

    private String userName;

    private String commitMessage;

    private Set<Quad> added;

    private Set<Quad> deleted;

    @Override
    public String toString() {
        var out = new ByteArrayOutputStream();
        try {
            new SparqlTransactionCodec().write(this, out);
            return out.toString("UTF-8");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
