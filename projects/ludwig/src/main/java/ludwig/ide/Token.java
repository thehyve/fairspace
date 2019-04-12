package ludwig.ide;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public class Token {
    private String id;
    private Object value;

    @Override
    public String toString() {
        return value != null ? value.toString() : "_";
    }
}
