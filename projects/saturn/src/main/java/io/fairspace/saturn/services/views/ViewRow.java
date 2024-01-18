package io.fairspace.saturn.services.views;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class ViewRow {

    private Map<String, Set<ValueDTO>> data = new HashMap<>();

    public ViewRow() {
    }

    // TODO, make obsolete by ViewStoreReader refactor
    public Map<String, Set<ValueDTO>> getRawData() {
        return Collections.unmodifiableMap(data);
    }

    public void put(String key, Set<ValueDTO> value) {
        data.put(key, value);
    }
}
