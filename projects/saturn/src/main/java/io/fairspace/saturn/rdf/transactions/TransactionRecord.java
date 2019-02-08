package io.fairspace.saturn.rdf.transactions;

import lombok.Data;
import org.apache.commons.io.output.ByteArrayOutputStream;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.modify.request.QuadDataAcc;
import org.apache.jena.sparql.modify.request.UpdateDataDelete;
import org.apache.jena.sparql.modify.request.UpdateDataInsert;
import org.apache.jena.update.UpdateRequest;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
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

    public UpdateRequest asUpdateRequest() {
        return new UpdateRequest()
                .add(new UpdateDataDelete(new QuadDataAcc(new ArrayList<>(deleted))))
                .add(new UpdateDataInsert(new QuadDataAcc(new ArrayList<>(added))));
    }
}
