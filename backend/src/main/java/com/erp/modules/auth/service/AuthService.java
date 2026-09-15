package com.erp.modules.auth.service;

import com.erp.exception.AppException;
import com.erp.modules.auth.dto.AuthResponse;
import com.erp.modules.auth.dto.LoginRequest;
import com.erp.modules.auth.dto.RefreshTokenRequest;
import com.erp.modules.auth.dto.UserDto;
import com.erp.modules.auth.entity.User;
import com.erp.modules.auth.repository.UserRepository;
import com.erp.security.JwtTokenProvider;
import com.erp.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AuthService {

    private static final Map<String, List<String>> DEFAULT_ROLE_PERMISSIONS = Map.of(
            "ADMIN", List.of("PRODUCT_VIEW", "PRODUCT_MANAGE", "PRICELIST_MANAGE", "CUSTOMER_VIEW", "CUSTOMER_MANAGE", "SO_CREATE", "SO_APPROVE", "SO_CANCEL", "SUPPLIER_VIEW", "SUPPLIER_MANAGE", "PO_CREATE", "PO_APPROVE", "DEBT_VIEW", "PAYMENT_CREATE", "STOCK_VIEW", "GRN_MANAGE", "GIN_MANAGE", "DASHBOARD_VIEW"),
            "SALES", List.of("PRODUCT_VIEW", "CUSTOMER_VIEW", "CUSTOMER_MANAGE", "SO_CREATE", "SO_CANCEL", "STOCK_VIEW", "DASHBOARD_VIEW"),
            "PURCHASING", List.of("PRODUCT_VIEW", "SUPPLIER_VIEW", "SUPPLIER_MANAGE", "PO_CREATE", "STOCK_VIEW", "DASHBOARD_VIEW"),
            "WAREHOUSE", List.of("PRODUCT_VIEW", "STOCK_VIEW", "GRN_MANAGE", "GIN_MANAGE", "DASHBOARD_VIEW"),
            "ACCOUNTANT", List.of("CUSTOMER_VIEW", "SUPPLIER_VIEW", "DEBT_VIEW", "PAYMENT_CREATE", "DASHBOARD_VIEW")
    );

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(request.getUsername());

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new AppException(404, "Người dùng không tồn tại"));

        return new AuthResponse(jwt, refreshToken, "Bearer", 86400000L, mapToUserDto(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse refresh(RefreshTokenRequest request) {
        if (!tokenProvider.validateToken(request.getRefreshToken())) {
            throw new AppException(401, "Refresh token không hợp lệ hoặc đã hết hạn");
        }

        String username = tokenProvider.getUsernameFromJWT(request.getRefreshToken());
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(404, "Người dùng không tồn tại"));

        UserPrincipal principal = UserPrincipal.create(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()
        );

        String newAccessToken = tokenProvider.generateToken(authentication);
        String newRefreshToken = tokenProvider.generateRefreshToken(username);

        return new AuthResponse(newAccessToken, newRefreshToken, "Bearer", 86400000L, mapToUserDto(user));
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new AppException(401, "Chưa xác thực");
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new AppException(404, "Người dùng không tồn tại"));

        return mapToUserDto(user);
    }

    public UserDto mapToUserDto(User user) {
        List<String> roles = user.getRoleList();
        List<String> permissions = user.getPermissionList();

        if (permissions.isEmpty() && user.getRole() != null) {
            String primaryRole = user.getRole().replace("ROLE_", "").toUpperCase();
            permissions = DEFAULT_ROLE_PERMISSIONS.getOrDefault(primaryRole, new ArrayList<>());
        }

        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getStatus(),
                roles,
                permissions
        );
    }
}
