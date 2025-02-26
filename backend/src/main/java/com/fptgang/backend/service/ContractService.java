package com.fptgang.backend.service;

import com.fptgang.backend.model.Contract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ContractService {
    Contract create(Contract contract);
    Contract update(Contract contract);
    Contract findById(long id);
    Contract deleteById(long id);
    Page<Contract> getAll(Pageable pageable, String filter, String search, boolean includeInvisible);
    default Page<Contract> getAll(Pageable pageable, String filter, String search) {
        return getAll(pageable, filter, search, false);
    }
    default Page<Contract> getAll(Pageable pageable, String filter) {
        return getAll(pageable, filter, null, false);
    }
}
