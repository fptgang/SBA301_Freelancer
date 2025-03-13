package com.fptgang.backend.repository;

import com.fptgang.backend.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContractRepos extends JpaRepository<Contract, Long>, JpaSpecificationExecutor<Contract> {
    Optional<Contract> findByContractId(Long contractId);
    Optional<Contract> findByProject_ProjectIdAndStatus(Long contractId, Contract.ContractStatus status);
}
