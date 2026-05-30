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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
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
            @PathVariable String id) {
        return employeeService.getEmployeeById(id)
                .map(emp -> ResponseEntity.ok(ApiResponse.success("Employee details retrieved", emp)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Employee not found")));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update employee details")
    public ResponseEntity<ApiResponse<Employee>> updateEmployee(
            @PathVariable String id,
            @RequestBody Employee employee) {
        try {
            Employee updated = employeeService.updateEmployee(id, employee);
            return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an employee")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(
            @PathVariable String id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully", null));
    }

    @PostMapping("/{id}/assign-vehicle")
    @Operation(summary = "Assign a vehicle to an employee")
    public ResponseEntity<ApiResponse<Employee>> assignVehicle(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String vehicleId = payload.get("vehicleId");
        if (vehicleId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("vehicleId is required"));
        }
        try {
            Employee updated = employeeService.assignVehicle(id, vehicleId);
            return ResponseEntity.ok(ApiResponse.success("Vehicle assigned successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/assign-vehicle/{vehicleId}")
    @Operation(summary = "Revoke vehicle assignment from an employee")
    public ResponseEntity<ApiResponse<Employee>> unassignVehicle(
            @PathVariable String id,
            @PathVariable String vehicleId) {
        try {
            Employee updated = employeeService.unassignVehicle(id, vehicleId);
            return ResponseEntity.ok(ApiResponse.success("Vehicle assignment revoked successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
