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
import java.util.stream.Collectors;

@Service
public class AuthService {

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
        List<String> roles = user.getRoles() != null ? user.getRoles().stream()
                .map(r -> "ROLE_" + r.getCode())
                .collect(Collectors.toList()) : new ArrayList<>();

        List<String> permissions = user.getRoles() != null ? user.getRoles().stream()
                .flatMap(r -> r.getPermissions() != null ? r.getPermissions().stream() : null)
                .filter(java.util.Objects::nonNull)
                .map(p -> p.getCode())
                .distinct()
                .collect(Collectors.toList()) : new ArrayList<>();

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
