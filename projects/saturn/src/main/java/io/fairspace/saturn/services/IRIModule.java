package io.fairspace.saturn.services;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import org.apache.jena.graph.Node;

import java.io.IOException;

import static org.apache.jena.graph.NodeFactory.createURI;

public class IRIModule extends SimpleModule {
    public IRIModule() {
        addSerializer(new IRISerializer());
        addDeserializer(Node.class, new IRIDeserializer());
    }

    public static class IRISerializer extends StdSerializer<Node> {
        public IRISerializer() {
            super(Node.class);
        }

        @Override
        public void serialize(Node value, JsonGenerator gen, SerializerProvider provider) throws IOException {
            gen.writeString(value.getURI());
        }
    }

    public static class IRIDeserializer extends StdDeserializer<Node> {
        protected IRIDeserializer() {
            super(Node.class);
        }

        @Override
        public Node deserialize(JsonParser p, DeserializationContext ctxt) throws IOException, JsonProcessingException {
            return createURI(p.getText());
        }
    }
}
