import {Account} from "./Account";
import {Project} from "./Project";

export enum ContractStatus {
  SIGNED = 'SIGNED',
  TERMINATED = 'TERMINATED',
  UNSIGNED = 'UNSIGNED'
}

export class Contract {
  contract_id: number | null;
  budget: number;
  created_at: Date;
  status: ContractStatus;
  updated_at: Date | null;
  file_id: number | null;
  freelancer_id: number;
  project_id: number;
  proposal_id: number;
  signed_at: Date | null;
  terminated_at: Date | null;

  freelancer: Account;
  project: Project;

  constructor(data: Partial<Contract> = {}) {
    this.contract_id = data.contract_id ?? null;
    this.budget = data.budget ?? 0;
    this.created_at = data.created_at ?? new Date();
    this.status = data.status ?? ContractStatus.UNSIGNED;
    this.updated_at = data.updated_at ?? null;
    this.file_id = data.file_id ?? null;
    this.freelancer_id = data.freelancer_id ?? 0;
    this.project_id = data.project_id ?? 0;
    this.proposal_id = data.proposal_id ?? 0;
    this.freelancer = data.freelancer ?? {} as Account;
    this.project = data.project ?? {} as Project;
    this.signed_at = data.signed_at ?? null;
    this.terminated_at = data.terminated_at ?? null;
  }

  static dump(contracts: Contract[]): string {
    if (!contracts.length) return "";

    const columns = [
      "contract_id",
      "budget",
      "created_at",
      "status",
      "updated_at",
      "signed_at",
      "terminated_at",
      "file_id",
      "freelancer_id",
      "project_id",
      "proposal_id"
    ];

    let sql = `INSERT INTO hirable.contract (${columns.join(", ")}) VALUES\n`;

    const values = contracts.map(contract => {
      const contractValues = [
        contract.contract_id !== null ? contract.contract_id : 'NULL',
        contract.budget.toFixed(2),
        contract.created_at ? `'${contract.created_at.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL',
        `'${contract.status}'`,
        contract.updated_at ? `'${contract.updated_at.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL',
        contract.signed_at ? `'${contract.signed_at.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL',
        contract.terminated_at ? `'${contract.terminated_at.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL',
        contract.file_id !== null ? contract.file_id : 'NULL',
        contract.freelancer_id,
        contract.project_id,
        contract.proposal_id
      ];

      return `(${contractValues.join(", ")})`;
    });

    sql += values.join(",\n");
    sql += ";";

    return sql;
  }
}

export default Contract;