package com.erp.exception;

public class BusinessException extends AppException {
    public BusinessException(String message) {
        super(422, message);
    }

    public BusinessException(int code, String message) {
        super(code, message);
    }
}
