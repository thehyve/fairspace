package io.fairspace.saturn.config;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.dataformat.yaml.*;

import javax.validation.constraints.*;
import java.util.*;

public class SearchConfig {
    static final ObjectMapper MAPPER = new ObjectMapper(new YAMLFactory());

    @JsonSetter(nulls = Nulls.AS_EMPTY)
    public List<View> views = new ArrayList<>();

    public enum ColumnType {
        Text,
        Set,
        Number,
        Identifier;

        @JsonValue
        public String getName() {
            return this.name();
        }

        private static final Map<String, ColumnType> mapping = new HashMap<>();
        static {
            for (ColumnType type: values()) {
                mapping.put(type.name().toLowerCase(), type);
            }
        }

        @JsonCreator
        public static ColumnType forName(String name) {
            if (name == null) {
                return null;
            }
            name = name.toLowerCase();
            if (!mapping.containsKey(name)) {
                throw new IllegalArgumentException("Unknown column type: " + name);
            }
            return mapping.get(name);
        }
    }

    public static class View {
        /**
         * The view name.
         */
        public String name;
        /**
         * The URLs of the types of entities that should be indexed in this view.
         */
        public List<String> types;
        /**
         * Specifies which other views (and which columns) to embed in this view.
         */
        public List<JoinView> join;
        /**
         * The columns of the view, not including columns from joined views.
         */
        public List<Column> columns;

        public static class Column {
            public String name;
            @NotNull
            public ColumnType type;
            public String source;
        }

        public static class JoinView {
            public String view;
            public String on;
            public boolean reverse = false;
            public List<String> include;
        }
    }
}
