package com.luxeway.repository;

import com.luxeway.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {

    List<Employee> findByOwnerId(String ownerId);

    List<Employee> findByOwnerIdAndStatus(String ownerId, String status);
}
