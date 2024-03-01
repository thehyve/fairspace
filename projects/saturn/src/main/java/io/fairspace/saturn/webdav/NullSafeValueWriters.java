package io.fairspace.saturn.webdav;

import java.util.Map;
import javax.xml.namespace.QName;

import io.milton.http.XmlWriter;
import io.milton.http.values.ValueAndType;
import io.milton.http.values.ValueWriters;

/**
 * Ignores null property values, which is needed to make it work with WebDAV-Client npm library
 */
public class NullSafeValueWriters extends ValueWriters {
    @Override
    public void writeValue(
            XmlWriter writer,
            QName qname,
            String prefix,
            ValueAndType vat,
            String href,
            Map<String, String> nsPrefixes) {
        if (vat.getValue() != null) {
            super.writeValue(writer, qname, prefix, vat, href, nsPrefixes);
        }
    }
}
