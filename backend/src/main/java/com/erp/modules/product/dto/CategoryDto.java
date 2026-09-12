package com.erp.modules.product.dto;

import java.util.ArrayList;
import java.util.List;

public class CategoryDto {
    private Long id;
    private String code;
    private String name;
    private Long parentId;
    private Integer sortOrder;
    private Boolean isActive;
    private List<CategoryDto> children = new ArrayList<>();

    public CategoryDto() {}

    public CategoryDto(Long id, String code, String name, Long parentId, Integer sortOrder, Boolean isActive) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.parentId = parentId;
        this.sortOrder = sortOrder;
        this.isActive = isActive;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public List<CategoryDto> getChildren() { return children; }
    public void setChildren(List<CategoryDto> children) { this.children = children; }
}
