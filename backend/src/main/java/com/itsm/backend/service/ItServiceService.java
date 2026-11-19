package com.itsm.backend.service;

import com.itsm.backend.domain.entity.ItService;
import com.itsm.backend.domain.entity.Category;
import com.itsm.backend.exception.*;
import com.itsm.backend.repository.ItServiceRepository;
import com.itsm.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ItServiceService {

    private final ItServiceRepository serviceRepository;
    private final CategoryRepository categoryRepository;

    public ItService createService(String name, String description, Long categoryId) {
        if (serviceRepository.existsByName(name)) {
            throw new DuplicateResourceException("Service already exists: " + name);
        }
        Category category = categoryId != null ? categoryRepository.findById(categoryId).orElse(null) : null;
        return serviceRepository.save(ItService.builder()
                .name(name).description(description).category(category).active(true).build());
    }

    @Transactional(readOnly = true)
    public List<ItService> getAllServices() { return serviceRepository.findAll(); }

    @Transactional(readOnly = true)
    public List<ItService> getActiveServices() { return serviceRepository.findByActiveTrue(); }

    @Transactional(readOnly = true)
    public ItService getById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ServiceNotFoundException(id));
    }

    public ItService update(Long id, String name, String description, Long categoryId, boolean active) {
        ItService svc = getById(id);
        Category category = categoryId != null ? categoryRepository.findById(categoryId).orElse(null) : null;
        svc.setName(name); svc.setDescription(description);
        svc.setCategory(category); svc.setActive(active);
        return serviceRepository.save(svc);
    }

    public void delete(Long id) { serviceRepository.deleteById(id); }
}
