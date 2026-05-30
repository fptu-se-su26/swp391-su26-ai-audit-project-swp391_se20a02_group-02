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
    public Employee updateEmployee(String id, Employee updated) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + id));
        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setRole(updated.getRole());
        existing.setStatus(updated.getStatus());
        return employeeRepository.save(existing);
    }

    @Transactional
    public void deleteEmployee(String id) {
        employeeRepository.deleteById(id);
    }

    @Transactional
    public Employee assignVehicle(String employeeId, String vehicleId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + employeeId));
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + vehicleId));
        
        employee.getAssignedVehicles().add(vehicle);
        return employeeRepository.save(employee);
    }

    @Transactional
    public Employee unassignVehicle(String employeeId, String vehicleId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + employeeId));
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + vehicleId));
        
        employee.getAssignedVehicles().remove(vehicle);
        return employeeRepository.save(employee);
    }
}
