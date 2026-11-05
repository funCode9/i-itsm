package com.itsm.backend.repository;

import com.itsm.backend.domain.entity.ItService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItServiceRepository extends JpaRepository<ItService, Long> {
    List<ItService> findByActiveTrue();
    List<ItService> findByCategoryId(Long categoryId);
    boolean existsByName(String name);
}
