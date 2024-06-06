package io.fairspace.saturn.rdf;

import org.apache.jena.datatypes.BaseDatatype;
import org.apache.jena.datatypes.RDFDatatype;

import io.fairspace.saturn.vocabulary.FS;

public class MarkdownDataType extends BaseDatatype {
    public static final RDFDatatype MARKDOWN_DATA_TYPE = new MarkdownDataType();

    private MarkdownDataType() {
        super(FS.MARKDOWN_URI);
    }

    @Override
    public Object parse(String lexicalForm) {
        return lexicalForm;
    }

    @Override
    public String unparse(Object value) {
        return value.toString();
    }
}
