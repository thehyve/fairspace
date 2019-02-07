package io.fairspace.saturn.rdf.search;

import org.apache.jena.query.text.Entity;
import org.apache.jena.query.text.EntityDefinition;
import org.apache.jena.query.text.TextDocProducer;
import org.apache.jena.query.text.TextIndex;
import org.apache.jena.sparql.core.DatasetChangesBatched;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.core.QuadAction;

import java.util.List;

import static org.apache.jena.query.text.TextQueryFuncs.graphNodeToString;
import static org.apache.jena.query.text.TextQueryFuncs.subjectToString;

/**
 * An implementation of TextDocProducer which differs from TextDocProducerTriples in two aspects:
 * - it indexes URI objects
 * - it reduces the number of calls to ES using batching. A batch contains quad changes with same graph, same subject, same action.
 */
public class SmartTextDocProducer extends DatasetChangesBatched implements TextDocProducer {
    private final TextIndex index;
    private final EntityDefinition defn;


    public SmartTextDocProducer(TextIndex index) {
        this.index = index;
        this.defn = index.getDocDef();
    }

    @Override
    protected void startBatched() {
    }

    @Override
    protected void finishBatched() {
    }

    @Override
    protected void dispatch(QuadAction quadAction, List<Quad> batch) {
        if (batch.isEmpty())
            return;

        switch (quadAction) {
            case ADD:
                index.addEntity(entity(batch));
                break;
            case DELETE:
                index.deleteEntity(entity(batch));
                break;
        }
    }

    private Entity entity(List<Quad> batch) {
        var firstQuad = batch.get(0);
        var graph = firstQuad.getGraph();
        var subject = firstQuad.getSubject();
        var graphString = graphNodeToString(graph);
        var entity = new Entity(subjectToString(subject), graphString);
        var graphField = defn.getGraphField();
        if (graphField != null) {
            entity.put(graphField, graphString);
        }

        for (var quad : batch) {
            var field = defn.getField(quad.getPredicate());
            if (field == null) {
                continue;
            }
            var o = quad.getObject();
            String val;
            if (o.isURI())
                val = o.getURI();
            else if (o.isLiteral())
                val = o.getLiteralLexicalForm();
            else { // blank nodes are transient
                continue;
            }
            entity.put(field, val);
        }
        return entity;
    }
}
