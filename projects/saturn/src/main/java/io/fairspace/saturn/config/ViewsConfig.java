package io.fairspace.saturn.config;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.dataformat.yaml.*;

import javax.validation.constraints.*;
import java.util.*;

public class ViewsConfig {
    static final ObjectMapper MAPPER = new ObjectMapper(new YAMLFactory());

    @JsonSetter(nulls = Nulls.AS_EMPTY)
    public List<View> views = new ArrayList<>();

    public enum ColumnType {
        Text,
        Set,
        Term,
        TermSet,
        Number,
        Date,
        Identifier;

        public boolean isSet() {
            return this == Set || this == TermSet;
        }

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
        @NotBlank public String name;
        /**
         * The view title.
         */
        @NotBlank public String title;
        /**
         * The name of the items that appear as rows.
         */
        public String itemName;
        /**
         * The URLs of the types of entities that should be indexed in this view.
         */
        @JsonSetter(nulls = Nulls.AS_EMPTY)
        public List<String> types;
        /**
         * Specifies which other views (and which columns) to embed in this view.
         */
        @JsonSetter(nulls = Nulls.AS_EMPTY)
        public List<JoinView> join;
        /**
         * The columns of the view, not including columns from joined views.
         */
        @JsonSetter(nulls = Nulls.AS_EMPTY)
        public List<Column> columns;


        public String fileLink;

        public static class Column {
            @NotBlank public String name;
            @NotBlank public String title;
            @NotNull public ColumnType type;
            @NotBlank public String source;
            public String query;
            public String rdfType;
            public int priority;
        }

        public static class JoinView {
            @NotBlank public String view;
            @NotBlank public String on;
            public boolean reverse = false;
            @JsonSetter(nulls = Nulls.AS_EMPTY)
            public List<String> include;
        }
    }
}
