package io.fairspace.saturn.rdf.search;

import org.apache.jena.graph.Node;
import org.apache.jena.query.text.TextIndex;
import org.apache.jena.sparql.core.QuadAction;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;
import static org.apache.jena.sparql.core.Quad.defaultGraphNodeGenerated;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class SingleTripleTextDocProducerTest {
    private static final Node SUBJECT = createURI("http://example.com/subject");
    private static final Node PREDICATE = createURI("http://example.com/predicate");
    private static final Node OBJECT = createURI("http://example.com/object");

    @Mock
    private TextIndex indexer;
    private SingleTripleTextDocProducer producer;

    @Before
    public void setup() {

        when(indexer.getDocDef()).thenReturn(new AutoEntityDefinition());
        producer = new SingleTripleTextDocProducer(indexer, false);

    }

    @Test
    public void shouldIndexTheDefaultGraph() {
        producer.change(QuadAction.ADD, defaultGraphIRI, SUBJECT, PREDICATE, OBJECT);
        producer.change(QuadAction.ADD, defaultGraphNodeGenerated, SUBJECT, PREDICATE, OBJECT);

        verify(indexer, times(2)).addEntity(any());
    }

    @Test
    public void shouldOnlyIndexTheDefaultGraph() {
        producer.change(QuadAction.ADD, createURI("http://example.com/graph"), SUBJECT, PREDICATE, OBJECT);;

        verify(indexer, times(0)).addEntity(any());
    }

}