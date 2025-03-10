import {escapeSingleQuotes} from "../utils.js";
import {Account} from "./Account.js";
import {ProposalStatus} from "./ProposalStatus.js";

export class Proposal {
  proposal_id: number;
  created_at: Date | null;
  budget: number;
  notes: string | null;
  status: ProposalStatus;
  updated_at: Date | null;
  freelancer_id: number;
  project_id: number;

  // not dump-able
  freelancer: Account | null;


  constructor(
    proposal_id: number,
    created_at: Date | null,
    budget: number,
    notes: string | null,
    status: ProposalStatus,
    updated_at: Date | null,
    freelancer_id: number,
    project_id: number,
    freelancer: Account | null
  ) {
    this.proposal_id = proposal_id;
    this.created_at = created_at;
    this.budget = budget;
    this.notes = notes;
    this.status = status;
    this.updated_at = updated_at;
    this.freelancer_id = freelancer_id;
    this.project_id = project_id;
    this.freelancer = freelancer;
  }

  static dump(proposals: Proposal[]): string {
    if (proposals.length === 0) return '';

    const values = proposals.map(proposal => {
      const created_at = proposal.created_at ?
        `'${proposal.created_at.toISOString().slice(0, 19)}.000000'` : 'NULL';
      const updated_at = proposal.updated_at ?
        `'${proposal.updated_at.toISOString().slice(0, 19)}.000000'` : 'NULL';
      const notes = proposal.notes ?
        `'${escapeSingleQuotes(proposal.notes)}'` : 'NULL';

      return `(${proposal.proposal_id},` +
        `${created_at},` +
        `${proposal.budget.toFixed(2)},` +
        `${notes},` +
        `'${proposal.status}',` +
        `${updated_at},` +
        `${proposal.freelancer_id},` +
        `${proposal.project_id})`;
    }).join(',\n');

    return `INSERT INTO proposals ` +
      `(proposal_id, created_at, budget, notes, status, updated_at, freelancer_id, project_id) ` +
      `VALUES\n${values};`;
  }
}