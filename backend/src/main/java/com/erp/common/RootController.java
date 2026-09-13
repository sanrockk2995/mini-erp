package com.erp.common;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@Tag(name = "Root & Health", description = "Root check API")
public class RootController {

    @GetMapping(value = {"/", "/test", "/tester"})
    @Operation(summary = "Dieu huong toi trang Testing Workbench UI")
    public ResponseEntity<Void> redirectToWorkbench() {
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create("/test.html"));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @GetMapping(value = "/api")
    @Operation(summary = "Kiem tra trang thai Backend RESTful API")
    public ApiResponse<Map<String, Object>> root() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("service", "Smart Mini-ERP Backend RESTful API");
        info.put("status", "UP");
        info.put("port", 7070);
        info.put("testingWorkbench", "http://localhost:7070/test.html");
        info.put("swaggerUI", "http://localhost:7070/swagger-ui/index.html");
        info.put("apiDocs", "http://localhost:7070/v3/api-docs");
        info.put("frontend", "http://localhost:3000");
        return ApiResponse.ok("Backend is running successfully on port 7070", info);
    }
}