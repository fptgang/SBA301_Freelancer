package com.fptgang.backend.service;

import com.fptgang.backend.model.Contract;
import com.fptgang.backend.service.params.ListParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ContractService {
    Contract create(Contract contract);
    Contract update(Contract contract);
    Contract findById(long id);
    Page<Contract> getAll(ListParams params);
    Contract signContract(long id);
    Contract terminateContract(long id);
}
