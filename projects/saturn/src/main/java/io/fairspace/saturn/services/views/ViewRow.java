package io.fairspace.saturn.services.views;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class ViewRow {
    private Map<String, Set<ValueDTO>> data;

    public ViewRow() {
        data = new HashMap<>();
    }

    // TODO, make obsolete by ViewStoreReader refactor
    public Map<String, Set<ValueDTO>> getRawData() {
        return data;
    }

    public void put(String key, Set<ValueDTO> value) {
        data.put(key, value);
    }
}
