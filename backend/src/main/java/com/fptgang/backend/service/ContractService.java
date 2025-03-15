package com.fptgang.backend.service;

import com.fptgang.backend.model.Contract;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.service.params.ListParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ContractService {
    Contract create(Long proposalId);
    Contract findById(long id);
    Page<Contract> getAll(ListParams params);
    Contract signContract(long contractId);
    Contract terminateContract(Contract contract);
}
