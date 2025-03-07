package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.Contract;
import com.fptgang.backend.repository.ContractRepos;
import com.fptgang.backend.service.ContractService;
import com.fptgang.backend.service.params.ListParams;
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
    public Page<Contract> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy( params.<Contract>toSpec(), "contractId");
        return contractRepos.findAll(spec, params.getPageable());
    }
}
