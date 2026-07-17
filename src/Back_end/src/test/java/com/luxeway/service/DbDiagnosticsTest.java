package com.luxeway.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;

@SpringBootTest
@ActiveProfiles("sqlserver")
public class DbDiagnosticsTest {

    @Autowired
    private DataSource dataSource;

    @Test
    public void printDbInfo() throws Exception {
        System.out.println("=== DB DIAGNOSTICS TEST ===");
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            System.out.println("JDBC URL: " + meta.getURL());
            System.out.println("Database Product Name: " + meta.getDatabaseProductName());
            System.out.println("Database Product Version: " + meta.getDatabaseProductVersion());
            System.out.println("Current Catalog/Database: " + conn.getCatalog());
            System.out.println("Current Schema: " + conn.getSchema());
            System.out.println("User: " + meta.getUserName());

            System.out.println("\nTables in current DB:");
            try (ResultSet rs = meta.getTables(conn.getCatalog(), null, "%", new String[]{"TABLE"})) {
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");
                    String schemaName = rs.getString("TABLE_SCHEM");
                    System.out.println("  " + schemaName + "." + tableName);
                }
            }
        }
        System.out.println("==========================");
    }
}
