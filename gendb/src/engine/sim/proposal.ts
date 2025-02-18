import {Proposal} from "../model/Proposal.js";
import {File} from "../model/File.js";
import {ProposalStatus} from "../model/ProposalStatus.js";
import {faker} from "@faker-js/faker";
import {AccountPool} from "./account.js";
import {AccountRole} from "../model/AccountRole.js";
import {ProjectStatus} from "../model/ProjectStatus.js";
import {ProjectPool} from "./project.js";
import {SqlFileAppender} from "../appender.js";
import { proposalFileAmount } from "../config.js";
import { FilePool } from "./file.js";

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

  pickProposal(date: Date, status?: ProposalStatus, projectId?: number): Proposal | null {
    const eligibleProposals = this.proposals.filter(proposal => {
      const matchesDate = proposal.created_at && proposal.created_at <= date;
      const matchesStatus = status ? proposal.status === status : true;
      const matchesProjectId = projectId ? proposal.project_id === projectId : true;
      const isVisible = proposal.is_visible;
      return matchesDate && matchesStatus && matchesProjectId && isVisible;
    });

    if (eligibleProposals.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * eligibleProposals.length);
    return eligibleProposals[randomIndex];
  }

  pickAllProposals(date: Date, status?: ProposalStatus, projectId?: number): Proposal[] {
    const eligibleProposals = this.proposals.filter(proposal => {
      const matchesDate = proposal.created_at && proposal.created_at <= date;
      const matchesStatus = status ? proposal.status === status : true;
      const matchesProjectId = projectId ? proposal.project_id === projectId : true;
      const isVisible = proposal.is_visible;
      return matchesDate && matchesStatus && matchesProjectId && isVisible;
    });
    return eligibleProposals;
  }
}

export let ProposalPool = new proposalPool();
export const ResetProposalPool = () => ProposalPool = new proposalPool();
export const DumpProposals = () => SqlFileAppender.append(ProposalPool.dump());

export const createProposal = (date: Date) => {
  const freelancer = AccountPool.pickAccount(date, AccountRole.FREELANCER, true);
  if (!freelancer) {
    return;
  }

  const project = ProjectPool.pickProject(date, ProjectStatus.OPEN);
  if (!project) {
    return;
  }

  const notes = faker.helpers.maybe(() => faker.lorem.paragraph(), {probability: 0.7});

  const proposal = new Proposal(
    ProposalPool.getNextId(),
    date,
    true,
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

  return proposal;
}

export const chooseProposal = (date: Date) => {
  const project = ProjectPool.pickProject(date, ProjectStatus.OPEN);
  if (!project) {
    return;
  }

  const proposals = ProposalPool.pickAllProposals(date, ProposalStatus.PENDING, project.project_id);
  if (proposals.length === 0) {
    return;
  }

  const pickedProposal = proposals[Math.floor(Math.random() * proposals.length)];
  pickedProposal.status = ProposalStatus.ACCEPTED;
  pickedProposal.updated_at = date;
  project.active_proposal_id = pickedProposal.proposal_id;
  project.activeProposal = pickedProposal;
  project.status = ProjectStatus.IN_PROGRESS;
  project.updated_at = date;

  proposals.forEach(proposal => {
    if (proposal.proposal_id !== pickedProposal.proposal_id) {
      proposal.status = ProposalStatus.REJECTED;
      proposal.updated_at = date;
    }
  });

  return pickedProposal;
}

