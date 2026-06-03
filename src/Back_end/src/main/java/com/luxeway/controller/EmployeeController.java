package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.Employee;
import com.luxeway.entity.User;
import com.luxeway.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
@Tag(name = "Employees", description = "Fleet and employee roster management")
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    @Operation(summary = "Create an employee team member")
    public ResponseEntity<ApiResponse<Employee>> createEmployee(
            @AuthenticationPrincipal User user,
            @RequestBody Employee employee) {
        Employee created = employeeService.createEmployee(user.getId(), employee);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee created successfully", created));
    }

    @GetMapping
    @Operation(summary = "List employees for the current owner")
    public ResponseEntity<ApiResponse<List<Employee>>> listEmployees(
            @AuthenticationPrincipal User user) {
        List<Employee> list = employeeService.listEmployees(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Employees retrieved successfully", list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee details by ID")
    public ResponseEntity<ApiResponse<Employee>> getEmployee(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return employeeService.getEmployeeById(id)
                .map(emp -> {
                    if (!isAdmin && !emp.getOwner().getId().equals(user.getId())) {
                        throw new org.springframework.security.access.AccessDeniedException("Not authorized to view this employee");
                    }
                    return ResponseEntity.ok(ApiResponse.success("Employee details retrieved", emp));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Employee not found")));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update employee details")
    public ResponseEntity<ApiResponse<Employee>> updateEmployee(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @RequestBody Employee employee) {
        try {
            boolean isAdmin = user.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            Employee updated = employeeService.updateEmployee(id, employee, user.getId(), isAdmin);
            return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", updated));
        } catch (org.springframework.security.access.AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an employee")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        employeeService.deleteEmployee(id, user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully", null));
    }

    @PostMapping("/{id}/assign-vehicle")
    @Operation(summary = "Assign a vehicle to an employee")
    public ResponseEntity<ApiResponse<Employee>> assignVehicle(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> payload) {
        String vehicleId = payload.get("vehicleId");
        if (vehicleId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("vehicleId is required"));
        }
        try {
            boolean isAdmin = user.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            Employee updated = employeeService.assignVehicle(id, vehicleId, user.getId(), isAdmin);
            return ResponseEntity.ok(ApiResponse.success("Vehicle assigned successfully", updated));
        } catch (org.springframework.security.access.AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/assign-vehicle/{vehicleId}")
    @Operation(summary = "Revoke vehicle assignment from an employee")
    public ResponseEntity<ApiResponse<Employee>> unassignVehicle(
            @PathVariable String id,
            @PathVariable String vehicleId,
            @AuthenticationPrincipal User user) {
        try {
            boolean isAdmin = user.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            Employee updated = employeeService.unassignVehicle(id, vehicleId, user.getId(), isAdmin);
            return ResponseEntity.ok(ApiResponse.success("Vehicle assignment revoked successfully", updated));
        } catch (org.springframework.security.access.AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
