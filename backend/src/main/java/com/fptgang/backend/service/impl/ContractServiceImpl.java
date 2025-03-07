package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.Contract;
import com.fptgang.backend.repository.ContractRepos;
import com.fptgang.backend.service.ContractService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
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
        contract.setContractId(null);
        return contractRepos.save(contract);
    }

    @Override
    public Contract update(Contract contract) {
//        if (contract.getContractId() == null) {
//            throw new IllegalArgumentException("Contract does not exist");
//        }
//        Contract existing = contractRepos.findById(contract.getContractId())
//                .orElseThrow(() -> new IllegalArgumentException("Contract does not exist"));
//        EntityUtil.merge(existing, contract);
        throw new IllegalArgumentException("Contract cant be updated");
//        return contractRepos.save(contract);
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
