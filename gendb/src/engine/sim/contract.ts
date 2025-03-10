import {SqlFileAppender} from "../appender.js";
import Contract, {ContractStatus} from "../model/Contract";
import {MilestoneStatus} from "../model/MilestoneStatus.js";

export class contractPool {
  private contracts: Contract[] = [];
  private nextId: number = 1;

  add(contract: Contract) {
    this.contracts.push(contract);
  }

  findUnsignedContract(date: Date): Contract | undefined {
    return this.contracts.find(contract => {
      const matchesStatus = contract.status === ContractStatus.UNSIGNED;
      const matchesDate = contract.created_at < date;
      const withinTimeline = date.getTime() < contract.project.start_date.getTime();
      return matchesStatus && matchesDate && withinTimeline;
    });
  }

  getNextId(): number {
    return this.nextId++;
  }

  dump(): string {
    const contractsDump = Contract.dump(this.contracts);
    return contractsDump.length > 0 ? '\n' + contractsDump : '';
  }

  count(): number {
    return this.contracts.length;
  }
}

export let ContractPool = new contractPool();
export const ResetContractPool = () => ContractPool = new contractPool();
export const DumpContracts = () => SqlFileAppender.append(ContractPool.dump());

export const signContract = (date: Date) => {
  const contract = ContractPool.findUnsignedContract(date);
  if (!contract || !contract.project || contract.project.activeMilestone) return false;
  contract.status = ContractStatus.SIGNED;
  contract.signed_at = date;
  contract.updated_at = date;

  contract.project.activeMilestone = contract.project.milestones[0];
  contract.project.activeMilestone.status = MilestoneStatus.IN_PROGRESS;
  contract.project.activeMilestone.updatedAt = date;
  return true;
}
