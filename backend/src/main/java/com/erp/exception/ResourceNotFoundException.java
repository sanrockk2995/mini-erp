package com.erp.exception;

public class ResourceNotFoundException extends AppException {
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(404, String.format("%s không tồn tại với %s: '%s'", resourceName, fieldName, fieldValue));
    }

    public ResourceNotFoundException(String message) {
        super(404, message);
    }
}
