import {Proposal} from "../model/Proposal.js";
import {File} from "../model/File.js";
import {ProposalStatus} from "../model/ProposalStatus.js";
import {faker} from "@faker-js/faker";
import {AccountPool} from "./account.js";
import {AccountRole} from "../model/AccountRole.js";
import {ProjectStatus} from "../model/ProjectStatus.js";
import {ProjectPool} from "./project.js";
import {SqlFileAppender} from "../appender.js";
import {proposalFileAmount} from "../config.js";
import {FilePool} from "./file.js";
import Contract, {ContractStatus} from "../model/Contract";
import {ContractPool} from "./contract";
import {TransactionPool} from "./transaction";
import {FundStatus} from "../model/FundStatus";

export class proposalPool {
  private proposals: Proposal[] = [];
  private nextId: number = 1;

  add(proposal: Proposal) {
    this.proposals.push(proposal);
  }

  getNextId(): number {
    return this.nextId++;
  }

  dump(): string {
    return '\n' + Proposal.dump(this.proposals);
  }

  pickAllProposals(date: Date, status?: ProposalStatus, projectId?: number): Proposal[] {
    const eligibleProposals = this.proposals.filter(proposal => {
      const matchesDate = proposal.created_at && proposal.created_at <= date;
      const matchesStatus = status ? proposal.status === status : true;
      const matchesProjectId = projectId ? proposal.project_id === projectId : true;
      return matchesDate && matchesStatus && matchesProjectId;
    });
    return eligibleProposals;
  }

  hasActiveProposal(date: Date, accountId: number, projectId: number): boolean {
    return this.proposals.some(proposal => {
      const matchesDate = proposal.created_at && proposal.created_at <= date;
      const matchesStatus = proposal.status === ProposalStatus.PENDING ||
        proposal.status === ProposalStatus.ACCEPTED;
      const matchesAccountId = proposal.freelancer_id === accountId;
      const matchesProjectId = proposal.project_id === projectId;
      return matchesDate && matchesStatus && matchesAccountId && matchesProjectId;
    });
  }

  count(): number {
    return this.proposals.length;
  }
}

export let ProposalPool = new proposalPool();
export const ResetProposalPool = () => ProposalPool = new proposalPool();
export const DumpProposals = () => SqlFileAppender.append(ProposalPool.dump());

export const createProposal = (date: Date) => {
  const freelancer = AccountPool.pickAccount(date, AccountRole.FREELANCER, true);
  if (!freelancer) {
    return false;
  }

  const project = ProjectPool.pickProjectInProposalSubmission(date);
  if (!project) {
    return false;
  }

  // Can only have 1 PENDING proposal. They can submit more if all previous proposals were EXPIRED, WITHDRAWN, or REJECTED
  if (ProposalPool.hasActiveProposal(date, freelancer.account_id, project.project_id)) {
    return false;
  }

  const notes = faker.helpers.maybe(() => faker.lorem.paragraph(), {probability: 0.7});

  const proposal = new Proposal(
    ProposalPool.getNextId(),
    date,
    faker.number.float({
      min: project.min_budget,
      max: project.max_budget
    }),
    notes ?? null,
    ProposalStatus.PENDING,
    date,
    freelancer.account_id,
    project.project_id,
    freelancer
  );

  ProposalPool.add(proposal);

  // create files
  const numFiles = faker.number.int(proposalFileAmount());
  for (let i = 0; i < numFiles; i++) {
    FilePool.add(new File({
      file_id: FilePool.getNextId(),
      created_at: date,
      file_name: faker.system.fileName(),
      file_type: faker.system.fileExt(),
      file_url: faker.image.url(),
      is_visible: true,
      size: faker.number.int(1000000),
      message_id: null,
      project_id: null,
      proposal_id: proposal.proposal_id,
      uploader_id: freelancer.account_id,
      milestone_id: null
    }));
  }

  return true;
}

export const withdrawProposal = (date: Date) => {
  const project = ProjectPool.pickProjectInProposalSubmission(date);
  if (!project) {
    return false;
  }

  const proposals = ProposalPool.pickAllProposals(date, ProposalStatus.PENDING, project.project_id);
  if (proposals.length === 0) {
    return false;
  }

  const pickedProposal = faker.helpers.arrayElement(proposals);
  pickedProposal.status = ProposalStatus.WITHDRAWN;
  pickedProposal.updated_at = date;
  return true;
}

export const chooseProposal = (date: Date) => {
  const project = ProjectPool.pickProjectInProposalSubmission(date);
  if (!project) {
    return false;
  }

  const proposals = ProposalPool.pickAllProposals(date, ProposalStatus.PENDING, project.project_id);
  if (proposals.length === 0) {
    return false;
  }

  const pickedProposal = faker.helpers.arrayElement(proposals);

  if (!pickedProposal.freelancer)
    return false;

  TransactionPool.depositEscrow(
    date, project.client,
    project.milestones[0].budgetRatio * pickedProposal.budget,
    project.milestones[0].milestoneId
  );
  project.milestones[0].fundStatus = FundStatus.DEPOSITED;
  project.milestones[0].updatedAt = date;

  pickedProposal.status = ProposalStatus.ACCEPTED;
  pickedProposal.updated_at = date;

  project.status = ProjectStatus.IN_PROGRESS;
  project.updated_at = date;

  proposals.forEach(proposal => {
    if (proposal.proposal_id !== pickedProposal.proposal_id
      && proposal.status === ProposalStatus.PENDING) {
      proposal.status = ProposalStatus.REJECTED;
      proposal.updated_at = date;
    }
  });

  const contract = {
    contract_id: ContractPool.getNextId(),
    budget: pickedProposal.budget,
    created_at: date,
    file_id: null,
    freelancer_id: pickedProposal.freelancer_id,
    project_id: project.project_id,
    proposal_id: pickedProposal.proposal_id,
    status: ContractStatus.UNSIGNED,
    updated_at: date
  } as Contract;

  contract.freelancer = pickedProposal.freelancer;
  contract.project = project;

  ContractPool.add(contract);
  project.contract = contract;

  return true;
}

