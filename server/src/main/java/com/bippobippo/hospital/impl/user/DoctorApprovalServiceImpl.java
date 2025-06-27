package com.bippobippo.hospital.impl.user;

import com.bippobippo.hospital.dto.request.user.DoctorApprovalRequestDto;
import com.bippobippo.hospital.dto.response.user.DoctorApprovalResponseDto;
import com.bippobippo.hospital.entity.user.DoctorApprovalRequest;
import com.bippobippo.hospital.entity.user.Role;
import com.bippobippo.hospital.entity.user.User;
import com.bippobippo.hospital.repository.user.DoctorApprovalRequestRepository;
import com.bippobippo.hospital.repository.user.RoleRepository;
import com.bippobippo.hospital.repository.user.UserRepository;
import com.bippobippo.hospital.service.user.DoctorApprovalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DoctorApprovalServiceImpl implements DoctorApprovalService {

    private final DoctorApprovalRequestRepository approvalRequestRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public DoctorApprovalResponseDto createRequest(Integer userId, DoctorApprovalRequestDto requestDto) {
        // 사용자 존재 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 이미 대기중인 요청이 있는지 확인
        approvalRequestRepository.findByUserIdAndStatus(userId, DoctorApprovalRequest.ApprovalStatus.PENDING)
                .ifPresent(request -> {
                    throw new RuntimeException("이미 대기중인 의사 권한 요청이 있습니다.");
                });

        // 면허번호 중복 확인
        approvalRequestRepository.findByLicenseNumber(requestDto.getLicenseNumber())
                .ifPresent(request -> {
                    throw new RuntimeException("이미 등록된 의사면허번호입니다.");
                });

        // 요청 생성
        DoctorApprovalRequest request = new DoctorApprovalRequest();
        request.setUser(user);
        request.setLicenseNumber(requestDto.getLicenseNumber());
        request.setHospitalName(requestDto.getHospitalName());
        request.setDepartment(requestDto.getDepartment());
        request.setSpecialization(requestDto.getSpecialization());
        request.setExperienceYears(requestDto.getExperienceYears());
        request.setRequestReason(requestDto.getRequestReason());
        request.setStatus(DoctorApprovalRequest.ApprovalStatus.PENDING);

        DoctorApprovalRequest savedRequest = approvalRequestRepository.save(request);
        return DoctorApprovalResponseDto.fromEntity(savedRequest);
    }

    @Override
    public Page<DoctorApprovalResponseDto> getAllRequests(Pageable pageable) {
        return approvalRequestRepository.findAll(pageable)
                .map(DoctorApprovalResponseDto::fromEntity);
    }

    @Override
    public Page<DoctorApprovalResponseDto> getRequestsByStatus(DoctorApprovalRequest.ApprovalStatus status, Pageable pageable) {
        return approvalRequestRepository.findByStatus(status, pageable)
                .map(DoctorApprovalResponseDto::fromEntity);
    }

    @Override
    public List<DoctorApprovalResponseDto> getRequestsByUserId(Integer userId) {
        return approvalRequestRepository.findByUserId(userId)
                .stream()
                .map(DoctorApprovalResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public DoctorApprovalResponseDto getRequestById(Integer requestId) {
        DoctorApprovalRequest request = approvalRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("요청을 찾을 수 없습니다."));
        return DoctorApprovalResponseDto.fromEntity(request);
    }

    @Override
    @Transactional
    public DoctorApprovalResponseDto approveRequest(Integer requestId, Integer adminId, String comment) {
        DoctorApprovalRequest request = approvalRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("요청을 찾을 수 없습니다."));

        if (request.getStatus() != DoctorApprovalRequest.ApprovalStatus.PENDING) {
            throw new RuntimeException("대기중인 요청만 승인할 수 있습니다.");
        }

        // 요청 승인
        request.setStatus(DoctorApprovalRequest.ApprovalStatus.APPROVED);
        request.setApprovedBy(adminId);
        request.setApprovedAt(LocalDateTime.now());
        request.setAdminComment(comment);

        // 사용자에게 DOCTOR 역할 부여
        User user = request.getUser();
        Role doctorRole = roleRepository.findByRoleName("DOCTOR")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setRoleName("DOCTOR");
                    newRole.setDescription("의사 권한");
                    return roleRepository.save(newRole);
                });

        user.getRoles().add(doctorRole);
        userRepository.save(user);

        DoctorApprovalRequest savedRequest = approvalRequestRepository.save(request);
        return DoctorApprovalResponseDto.fromEntity(savedRequest);
    }

    @Override
    @Transactional
    public DoctorApprovalResponseDto rejectRequest(Integer requestId, Integer adminId, String comment) {
        DoctorApprovalRequest request = approvalRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("요청을 찾을 수 없습니다."));

        if (request.getStatus() != DoctorApprovalRequest.ApprovalStatus.PENDING) {
            throw new RuntimeException("대기중인 요청만 거부할 수 있습니다.");
        }

        // 요청 거부
        request.setStatus(DoctorApprovalRequest.ApprovalStatus.REJECTED);
        request.setApprovedBy(adminId);
        request.setApprovedAt(LocalDateTime.now());
        request.setAdminComment(comment);

        DoctorApprovalRequest savedRequest = approvalRequestRepository.save(request);
        return DoctorApprovalResponseDto.fromEntity(savedRequest);
    }

    @Override
    public long getPendingCount() {
        return approvalRequestRepository.countPendingRequests();
    }

    @Override
    public long getApprovedCount() {
        return approvalRequestRepository.countApprovedRequests();
    }

    @Override
    public long getRejectedCount() {
        return approvalRequestRepository.countRejectedRequests();
    }
} 