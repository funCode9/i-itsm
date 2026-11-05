package com.itsm.backend.service;

import com.itsm.backend.domain.entity.Category;
import com.itsm.backend.exception.DuplicateResourceException;
import com.itsm.backend.exception.ResourceNotFoundException;
import com.itsm.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public Category createCategory(String name, String description, String keywords) {
        if (categoryRepository.existsByName(name)) {
            throw new DuplicateResourceException("Category already exists: " + name);
        }
        return categoryRepository.save(Category.builder()
                .name(name).description(description).keywords(keywords).active(true).build());
    }

    @Transactional(readOnly = true)
    public List<Category> getAllCategories() { return categoryRepository.findAll(); }

    @Transactional(readOnly = true)
    public List<Category> getActiveCategories() { return categoryRepository.findByActiveTrue(); }

    @Transactional(readOnly = true)
    public Category getById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }

    public Category update(Long id, String name, String description, String keywords, boolean active) {
        Category c = getById(id);
        c.setName(name); c.setDescription(description);
        c.setKeywords(keywords); c.setActive(active);
        return categoryRepository.save(c);
    }

    public void delete(Long id) { categoryRepository.deleteById(id); }
}
