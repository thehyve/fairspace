package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vocabulary.FS;
import io.milton.property.PropertySource;
import lombok.NonNull;
import lombok.experimental.Delegate;
import lombok.extern.slf4j.Slf4j;

import javax.xml.namespace.QName;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
public class MiltonMapPropertySource<T> {
    protected static String DEFAULT_NAMESPACE = FS.NS;
    protected final String namespace;

    @Delegate
    protected final Map<String, T> propertySource;

    public MiltonMapPropertySource() {
        this(DEFAULT_NAMESPACE);
    }

    public MiltonMapPropertySource(String namespace) {
        this(namespace, new HashMap<>());
    }

    public MiltonMapPropertySource(@NonNull Map<String, T> propertySource) {
        this(DEFAULT_NAMESPACE, propertySource);
    }

    public MiltonMapPropertySource(String namespace, @NonNull Map<String, T> propertySource) {
        this.namespace = namespace;
        this.propertySource = propertySource;
    }

    public List<QName> getPropertyNames() {
        return propertySource.keySet().stream()
                .map(name -> new QName(namespace, name))
                .collect(Collectors.toList());
    }

    public boolean hasProperty(QName name) {
        return name.getNamespaceURI().equals(namespace) && propertySource.containsKey(name.getLocalPart());
    }

    public PropertySource.PropertyMetaData getPropertyMeta(QName name) {
        var value = getProperty(name);

        if(value == null) return null;
        return new PropertySource.PropertyMetaData(PropertySource.PropertyAccessibility.READ_ONLY, value.getClass());
    }

    public T getProperty(QName name) {
        if(!hasProperty(name)) return null;
        return propertySource.get(name.getLocalPart());
    }
}


