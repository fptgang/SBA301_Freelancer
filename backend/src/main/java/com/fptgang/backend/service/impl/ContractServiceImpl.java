package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.Contract;
import com.fptgang.backend.repository.ContractRepos;
import com.fptgang.backend.service.ContractService;
import com.fptgang.backend.util.OpenApiHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ContractServiceImpl implements ContractService {

    @Autowired
    private ContractRepos contractRepos;


    @Override
    public Contract create(Contract contract) {
        return contractRepos.save(contract);
    }

    @Override
    public Contract update(Contract contract) {
        if (contract.getContractId() == null || contractRepos.findByContractId(contract.getContractId()).isEmpty()) {
            throw new IllegalArgumentException("Contract does not exist");
        }
        return contractRepos.save(contract);
    }

    @Override
    public Contract findById(long id) {
        return contractRepos.findById(id).orElseThrow(
                () -> new IllegalArgumentException("Contract does not exist")
        );
    }

    @Override
    public Contract deleteById(long id) {
        Contract contract = findById(
                id
        );
        contract.setVisible(false);
        return contractRepos.save(contract);
    }

    @Override
    public Page<Contract> getAll(Pageable pageable, String filter, String search, boolean includeInvisible) {
        var spec = OpenApiHelper.<Contract>filterToSpec(filter);
        spec = spec.and(OpenApiHelper.searchToSpec(search));
        if (!includeInvisible) {
            spec = spec.and((a, _, cb) -> cb.isTrue(a.get("isVisible")));
        }
        return contractRepos.findAll(spec, pageable);
    }
}
