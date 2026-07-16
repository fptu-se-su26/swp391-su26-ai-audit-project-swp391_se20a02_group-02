package com.luxeway.service;

import com.luxeway.entity.Employee;
import com.luxeway.entity.User;
import com.luxeway.entity.Vehicle;
import com.luxeway.repository.EmployeeRepository;
import com.luxeway.repository.UserRepository;
import com.luxeway.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    @Transactional
    public Employee createEmployee(String ownerId, Employee employee) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("Owner not found: " + ownerId));
        employee.setOwner(owner);
        return employeeRepository.save(employee);
    }

    public List<Employee> listEmployees(String ownerId) {
        return employeeRepository.findByOwnerId(ownerId);
    }

    public Optional<Employee> getEmployeeById(String id) {
        return employeeRepository.findById(id);
    }

    @Transactional
    public Employee updateEmployee(String id, Employee updated, String ownerId, boolean isAdmin) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + id));
        if (!isAdmin && !existing.getOwner().getId().equals(ownerId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to update this employee");
        }
        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setRole(updated.getRole());
        existing.setStatus(updated.getStatus());
        return employeeRepository.save(existing);
    }

    @Transactional
    public void deleteEmployee(String id, String ownerId, boolean isAdmin) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + id));
        if (!isAdmin && !existing.getOwner().getId().equals(ownerId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to delete this employee");
        }
        employeeRepository.delete(existing);
    }

    @Transactional
    public Employee assignVehicle(String employeeId, String vehicleId, String ownerId, boolean isAdmin) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + employeeId));
        if (!isAdmin && !employee.getOwner().getId().equals(ownerId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to modify this employee");
        }
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + vehicleId));
        if (!isAdmin && !vehicle.getOwner().getId().equals(ownerId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to assign this vehicle");
        }
        employee.getAssignedVehicles().add(vehicle);
        return employeeRepository.save(employee);
    }

    @Transactional
    public Employee unassignVehicle(String employeeId, String vehicleId, String ownerId, boolean isAdmin) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + employeeId));
        if (!isAdmin && !employee.getOwner().getId().equals(ownerId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to modify this employee");
        }
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + vehicleId));
        
        employee.getAssignedVehicles().remove(vehicle);
        return employeeRepository.save(employee);
    }
}
