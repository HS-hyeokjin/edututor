package com.tls.edututor.course.material.repository;

import com.tls.edututor.course.material.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MaterialRepository extends JpaRepository<Material, Long> {

  Optional<Material> findByUnitId(Long unitId);

}
