package io.fairspace.saturn.services.views;

import java.sql.*;

public class QueryException extends RuntimeException {
    QueryException(String message, SQLException cause) {
        super(message, cause);
    }
}
