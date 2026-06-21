package com.luxeway.repository;

import com.luxeway.entity.CorporateEmployee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CorporateEmployeeRepository extends JpaRepository<CorporateEmployee, String> {
    Optional<CorporateEmployee> findByUserId(String userId);
    List<CorporateEmployee> findByDepartmentId(String departmentId);
}
