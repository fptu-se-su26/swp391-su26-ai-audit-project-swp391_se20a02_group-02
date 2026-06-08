package com.luxeway.repository;

import com.luxeway.entity.CompanyBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CompanyBookingRepository extends JpaRepository<CompanyBooking, String> {
    List<CompanyBooking> findByCompanyId(String companyId);
    List<CompanyBooking> findByDepartmentId(String departmentId);
    List<CompanyBooking> findByStatus(String status);
}
