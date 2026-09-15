package com.erp.modules.auth.entity;

import com.erp.common.BaseEntity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false, length = 50)
    private String role = "ADMIN";

    @Column(columnDefinition = "TEXT")
    private String permissions;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    public User() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getPermissions() { return permissions; }
    public void setPermissions(String permissions) { this.permissions = permissions; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getRoleList() {
        List<String> list = new ArrayList<>();
        if (role != null && !role.trim().isEmpty()) {
            for (String r : role.split(",")) {
                String trimmed = r.trim();
                if (!trimmed.isEmpty()) {
                    list.add(trimmed.startsWith("ROLE_") ? trimmed : "ROLE_" + trimmed);
                }
            }
        }
        return list;
    }

    public List<String> getPermissionList() {
        List<String> list = new ArrayList<>();
        if (permissions != null && !permissions.trim().isEmpty()) {
            for (String p : permissions.split(",")) {
                String trimmed = p.trim();
                if (!trimmed.isEmpty()) {
                    list.add(trimmed);
                }
            }
        }
        return list;
    }
}
