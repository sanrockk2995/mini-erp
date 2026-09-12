package com.erp.modules.product.service;

import com.erp.exception.AppException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.modules.product.dto.CategoryDto;
import com.erp.modules.product.dto.CategoryRequest;
import com.erp.modules.product.entity.Category;
import com.erp.modules.product.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategoryTree() {
        List<Category> allCategories = categoryRepository.findAllByOrderBySortOrderAsc();
        Map<Long, CategoryDto> dtoMap = new HashMap<>();
        List<CategoryDto> rootCategories = new ArrayList<>();

        for (Category cat : allCategories) {
            CategoryDto dto = mapToDto(cat);
            dtoMap.put(cat.getId(), dto);
        }

        for (Category cat : allCategories) {
            CategoryDto dto = dtoMap.get(cat.getId());
            if (cat.getParentId() == null) {
                rootCategories.add(dto);
            } else {
                CategoryDto parentDto = dtoMap.get(cat.getParentId());
                if (parentDto != null) {
                    parentDto.getChildren().add(dto);
                } else {
                    rootCategories.add(dto);
                }
            }
        }

        return rootCategories;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllFlat() {
        List<Category> list = categoryRepository.findAllByOrderBySortOrderAsc();
        List<CategoryDto> dtos = new ArrayList<>();
        for (Category cat : list) {
            dtos.add(mapToDto(cat));
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public CategoryDto getById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", id));
        return mapToDto(category);
    }

    @Transactional
    public CategoryDto create(CategoryRequest request) {
        if (categoryRepository.existsByCode(request.getCode())) {
            throw new AppException(400, "Mã danh mục đã tồn tại: " + request.getCode());
        }

        Category category = new Category();
        category.setCode(request.getCode());
        category.setName(request.getName());
        category.setParentId(request.getParentId());
        category.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        category.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        Category saved = categoryRepository.save(category);
        return mapToDto(saved);
    }

    @Transactional
    public CategoryDto update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", id));

        if (!category.getCode().equals(request.getCode()) && categoryRepository.existsByCode(request.getCode())) {
            throw new AppException(400, "Mã danh mục đã tồn tại: " + request.getCode());
        }

        category.setCode(request.getCode());
        category.setName(request.getName());
        category.setParentId(request.getParentId());
        if (request.getSortOrder() != null) category.setSortOrder(request.getSortOrder());
        if (request.getIsActive() != null) category.setIsActive(request.getIsActive());

        Category saved = categoryRepository.save(category);
        return mapToDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", id));
        categoryRepository.delete(category);
    }

    private CategoryDto mapToDto(Category cat) {
        return new CategoryDto(
                cat.getId(),
                cat.getCode(),
                cat.getName(),
                cat.getParentId(),
                cat.getSortOrder(),
                cat.getIsActive()
        );
    }
}
