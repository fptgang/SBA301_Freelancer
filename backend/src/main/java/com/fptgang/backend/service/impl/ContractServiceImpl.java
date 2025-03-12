package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.Contract;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.ContractRepos;
import com.fptgang.backend.service.ContractService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
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
        contract.setStatus(Contract.ContractStatus.UNSIGNED);
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

    @Override
    public Contract signContract(long id) {
        Contract contract = contractRepos.findById(id).orElseThrow(
                () -> new IllegalArgumentException("Contract does not exist")
        );
        if(contract.getStatus() == Contract.ContractStatus.SIGNED){
            throw new IllegalArgumentException("Contract is already signed");
        }
        if(SecurityUtil.requireCurrentUserId() != contract.getProposal().getFreelancer().getAccountId()){
            throw new IllegalArgumentException("You are not allowed to sign this contract");
        }
        contract.setStatus(Contract.ContractStatus.SIGNED);
        return contractRepos.save(contract);
    }

    @Override
    public Contract terminateContract(long id) {
        Contract contract = contractRepos.findById(id).orElseThrow(
                () -> new IllegalArgumentException("Contract does not exist")
        );
        if(contract.getStatus() == Contract.ContractStatus.TERMINATED){
            throw new IllegalArgumentException("Contract is already terminated");
        }
        if(SecurityUtil.requireCurrentUserId() != contract.getProject().getClient().getAccountId()||
        SecurityUtil.hasPermission(Role.STAFF) || SecurityUtil.hasPermission(Role.ADMIN)){
            throw new IllegalArgumentException("You are not allowed to terminate this contract");
        }
        contract.setStatus(Contract.ContractStatus.TERMINATED);
        return contractRepos.save(contract);
    }
}
