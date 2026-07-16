package com.luxeway.repository;

import com.luxeway.entity.ServiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ServiceStatusRepository extends JpaRepository<ServiceStatus, Integer> {
    Optional<ServiceStatus> findByServiceName(String serviceName);
}
