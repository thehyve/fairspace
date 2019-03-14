package io.fairspace.saturn.rdf.search;

import io.fairspace.saturn.rdf.AbstractDatasetChanges;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.query.text.Entity;
import org.apache.jena.query.text.EntityDefinition;
import org.apache.jena.query.text.TextDocProducer;
import org.apache.jena.query.text.TextIndex;
import org.apache.jena.sparql.core.QuadAction;

import static org.apache.jena.query.text.TextQueryFuncs.graphNodeToString;
import static org.apache.jena.query.text.TextQueryFuncs.subjectToString;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;
import static org.apache.jena.sparql.core.Quad.defaultGraphNodeGenerated;

/**
 * An implementation of TextDocProducer which allows to index URI objects
 */
@Slf4j
public class SingleTripleTextDocProducer extends AbstractDatasetChanges implements TextDocProducer {
    private final EntityDefinition defn;
    private final TextIndex indexer;
    private final boolean swallowExceptions;


    public SingleTripleTextDocProducer(TextIndex indexer, boolean swallowExceptions) {
        this.defn = indexer.getDocDef();
        this.indexer = indexer;
        this.swallowExceptions = swallowExceptions;
    }

    @Override
    public void change(QuadAction qaction, Node g, Node s, Node p, Node o) {
        if (qaction != QuadAction.ADD && qaction != QuadAction.DELETE) {
            return;
        }
        if (!g.equals(defaultGraphIRI) && !g.equals(defaultGraphNodeGenerated)) {
            return;
        }

        var entity = createEntity(g, s, p, o);
        if (entity != null) {
            try {
                if (qaction == QuadAction.ADD) {
                    indexer.addEntity(entity);
                } else {
                    indexer.deleteEntity(entity);
                }
            } catch (Throwable t) {
                if (swallowExceptions) {
                    log.warn("Error indexing in ElasticSearch", t);
                } else {
                    throw t;
                }
            }
        }
    }

    private Entity createEntity(Node g, Node s, Node p, Node o) {
        var graphString = graphNodeToString(g);
        var entity = new Entity(subjectToString(s), graphString);
        var graphField = defn.getGraphField();
        if (graphField != null) {
            entity.put(graphField, graphString);
        }

        var field = defn.getField(p);
        if (field == null) {
            return null;
        }

        String val;
        if (o.isURI())
            val = o.getURI();
        else if (o.isLiteral()) {
            val = o.getLiteralLexicalForm();
        } else {
            return null;
        }

        entity.put(field, val);

        return entity;
    }
}
