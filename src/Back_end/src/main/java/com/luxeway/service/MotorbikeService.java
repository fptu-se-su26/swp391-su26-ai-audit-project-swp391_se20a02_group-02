package com.luxeway.service;

import com.luxeway.dto.motorbike.MotorbikeDTOs;
import com.luxeway.entity.*;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MotorbikeService {

    private final MotorbikeRepository motorbikeRepository;
    private final MotorbikeBrandRepository motorbikeBrandRepository;
    private final MotorbikeModelRepository motorbikeModelRepository;
    private final UserRepository userRepository;
    private final TranslationService translationService;

    public Page<MotorbikeDTOs.MotorbikeResponse> searchMotorbikes(
            String city, Integer engineCc, String transmission,
            Boolean helmetIncluded, Boolean raincoatIncluded, Boolean phoneHolder, Boolean luggageRack,
            int page, int size) {
        
        com.luxeway.enums.TransmissionType transEnum = null;
        if (transmission != null && !transmission.trim().isEmpty()) {
            try {
                transEnum = com.luxeway.enums.TransmissionType.valueOf(transmission.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid transmission type
            }
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Motorbike> motorbikePage = motorbikeRepository.searchMotorbikes(
            city, engineCc, transEnum, helmetIncluded, raincoatIncluded, phoneHolder, luggageRack, pageable
        );
        return motorbikePage.map(this::toResponse);
    }

    public MotorbikeDTOs.MotorbikeResponse getMotorbikeById(String id) {
        Motorbike motorbike = motorbikeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Motorbike not found with ID: " + id));
        return toResponse(motorbike);
    }

    @Transactional
    public MotorbikeDTOs.MotorbikeResponse createMotorbike(MotorbikeDTOs.CreateMotorbikeRequest request, String ownerId) {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("Owner not found"));

        MotorbikeModel model = motorbikeModelRepository.findById(request.getModelId())
            .orElseThrow(() -> new RuntimeException("Motorbike Model not found"));

        Motorbike motorbike = Motorbike.builder()
            .name(request.getName())
            .model(model)
            .owner(owner)
            .licensePlate(request.getLicensePlate())
            .pricePerDay(request.getPricePerDay())
            .deposit(request.getDeposit())
            .status(VehicleStatus.AVAILABLE)
            .build();

        motorbike = motorbikeRepository.save(motorbike);

        MotorbikeSpecification spec = MotorbikeSpecification.builder()
            .motorbike(motorbike)
            .engineCc(request.getEngineCc())
            .transmission(request.getTransmission())
            .helmetIncluded(request.getHelmetIncluded() != null ? request.getHelmetIncluded() : true)
            .raincoatIncluded(request.getRaincoatIncluded() != null ? request.getRaincoatIncluded() : true)
            .phoneHolder(request.getPhoneHolder() != null ? request.getPhoneHolder() : false)
            .luggageRack(request.getLuggageRack() != null ? request.getLuggageRack() : false)
            .build();
        motorbike.setSpecification(spec);

        MotorbikeLocation loc = MotorbikeLocation.builder()
            .motorbike(motorbike)
            .city(request.getCity())
            .address(request.getAddress())
            .latitude(request.getLatitude() != null ? java.math.BigDecimal.valueOf(request.getLatitude()) : null)
            .longitude(request.getLongitude() != null ? java.math.BigDecimal.valueOf(request.getLongitude()) : null)
            .build();
        motorbike.setLocation(loc);

        if (request.getImageUrls() != null) {
            Set<MotorbikeImage> images = new HashSet<>();
            int order = 0;
            for (String url : request.getImageUrls()) {
                images.add(MotorbikeImage.builder()
                    .motorbike(motorbike)
                    .url(url)
                    .isPrimary(order == 0)
                    .sortOrder(order++)
                    .build());
            }
            motorbike.setImages(images);
        }

        return toResponse(motorbikeRepository.save(motorbike));
    }

    @Transactional
    public void deleteMotorbike(String id) {
        if (!motorbikeRepository.existsById(id)) {
            throw new RuntimeException("Motorbike not found");
        }
        motorbikeRepository.deleteById(id);
    }

    public MotorbikeDTOs.MotorbikeResponse toResponse(Motorbike motorbike) {
        String lang = translationService.getCurrentLanguageCode();
        MotorbikeDTOs.MotorbikeResponse response = new MotorbikeDTOs.MotorbikeResponse();
        response.setId(motorbike.getId());
        response.setName(translationService.translateMotorbike(motorbike.getId(), lang, motorbike.getName(), null, "name"));
        response.setBrandName(motorbike.getModel().getBrand().getName());
        response.setModelName(motorbike.getModel().getName());
        response.setCategory(motorbike.getModel().getCategory());
        response.setLicensePlate(motorbike.getLicensePlate());
        response.setPricePerDay(motorbike.getPricePerDay());
        response.setDeposit(motorbike.getDeposit());
        response.setStatus(motorbike.getStatus().name());
        response.setRating(motorbike.getRating().doubleValue());
        response.setTotalReviews(motorbike.getTotalReviews());

        if (motorbike.getLocation() != null) {
            response.setCity(motorbike.getLocation().getCity());
            response.setAddress(motorbike.getLocation().getAddress());
            response.setLatitude(motorbike.getLocation().getLatitude() != null ? motorbike.getLocation().getLatitude().doubleValue() : null);
            response.setLongitude(motorbike.getLocation().getLongitude() != null ? motorbike.getLocation().getLongitude().doubleValue() : null);
        }

        if (motorbike.getSpecification() != null) {
            response.setEngineCc(motorbike.getSpecification().getEngineCc());
            response.setTransmission(motorbike.getSpecification().getTransmission().name());
            response.setHelmetIncluded(motorbike.getSpecification().getHelmetIncluded());
            response.setRaincoatIncluded(motorbike.getSpecification().getRaincoatIncluded());
            response.setPhoneHolder(motorbike.getSpecification().getPhoneHolder());
            response.setLuggageRack(motorbike.getSpecification().getLuggageRack());
        }

        if (motorbike.getImages() != null) {
            response.setImages(motorbike.getImages().stream()
                .map(MotorbikeImage::getUrl)
                .collect(Collectors.toList()));
        }

        if (motorbike.getOwner() != null) {
            MotorbikeDTOs.OwnerInfo ownerInfo = new MotorbikeDTOs.OwnerInfo();
            ownerInfo.setId(motorbike.getOwner().getId());
            ownerInfo.setDisplayName(motorbike.getOwner().getDisplayName());
            ownerInfo.setAvatar(motorbike.getOwner().getAvatar());
            response.setOwner(ownerInfo);
        }

        return response;
    }
}
