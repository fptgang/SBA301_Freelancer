import {ProjectStatus} from "../model/ProjectStatus";
import {MilestoneStatus} from "../model/MilestoneStatus";
import {TransactionPool} from "./transaction";
import {faker} from "@faker-js/faker";
import {
  milestoneDeadlineIncreaseDays,
  milestoneDeliverableFileAmount
} from "../config";
import {FilePool} from "./file";
import {File} from "../model/File";
import {ProjectPool} from "./project";
import {TransactionType} from "../model/TransactionType";
import {TransactionStatus} from "../model/TransactionStatus";
import {FundStatus} from "../model/FundStatus";

export const submitWork = (date: Date) => {
  const project = ProjectPool.pickProjectWithActiveMilestone(date, ProjectStatus.IN_PROGRESS);
  if (!project || !project.activeMilestone || !project.contract)
    return false;

  let milestone = project.activeMilestone;
  if (milestone.status !== MilestoneStatus.IN_PROGRESS && milestone.status !== MilestoneStatus.REVIEWING)
    return false;

  if (milestone.status === MilestoneStatus.IN_PROGRESS) {
    milestone.status = MilestoneStatus.REVIEWING;
    milestone.updatedAt = date;
  }

  // create deliverable files
  const numFiles = faker.number.int(milestoneDeliverableFileAmount());

  if (FilePool.countMilestoneDeliverables(milestone.milestoneId) >= numFiles)
    return false;

  //console.log(`Creating ${numFiles} deliverable files for milestone ${milestone.milestoneId}`);

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
      proposal_id: null,
      uploader_id: project.contract.freelancer_id,
      milestone_id: milestone.milestoneId
    }));
  }
  return true;
};

export const confirmWork = (date: Date) => {
  const project = ProjectPool.pickProjectWithActiveMilestone(date, ProjectStatus.IN_PROGRESS);
  if (!project || !project.activeMilestone || !project.contract)
    return false;

  let milestone = project.activeMilestone;
  if (milestone.status !== MilestoneStatus.REVIEWING)
    return false;

  milestone.status = MilestoneStatus.FINISHED;
  milestone.updatedAt = date;

  const hasMilestoneEscrowReleased = TransactionPool.pickTransaction(
    TransactionType.ESCROW_RELEASE, TransactionStatus.SUCCESS, milestone.milestoneId).length > 0;
  if (!hasMilestoneEscrowReleased) {
    TransactionPool.releaseEscrow(date, project.contract.freelancer, project.contract.budget * milestone.budgetRatio, milestone.milestoneId);

    milestone.fundStatus = FundStatus.RELEASED;
    milestone.updatedAt = date;
  }

  project.activeMilestone = null;
  project.updated_at = date;

  const nextMilestone = project.nextMilestone();
  if (!nextMilestone) {
    project.status = ProjectStatus.FINISHED;
    project.updated_at = date;
    return true;
  }

  milestone = nextMilestone;
  milestone.status = MilestoneStatus.IN_PROGRESS;
  milestone.fundStatus = FundStatus.DEPOSITED;
  milestone.updatedAt = date;
  project.activeMilestone = milestone;
  project.updated_at = date;

  TransactionPool.depositEscrow(date, project.client, project.contract.budget * milestone.budgetRatio, milestone.milestoneId)
  return true;
}

export const extendDeadline = (date: Date) => {
  const project = ProjectPool.pickProjectWithActiveMilestone(date, ProjectStatus.IN_PROGRESS);
  if (!project || !project.activeMilestone)
    return false;

  if (date < project.activeMilestone.deadline) {
    return false;
  }

  let newDeadline = new Date(date.getTime() + faker.number.int(milestoneDeadlineIncreaseDays()) * 24 * 60 * 60 * 1000);
  project.activeMilestone.deadline = newDeadline;
  project.activeMilestone.updatedAt = date;

  for (const milestone of project.milestones) {
    if (milestone.status === MilestoneStatus.PENDING) {
      newDeadline = new Date(newDeadline.getTime() +
        faker.number.int(milestoneDeadlineIncreaseDays()) * 24 * 60 * 60 * 1000);
      milestone.deadline = newDeadline;
      milestone.updatedAt = date;
    }
  }

  return true;
}

export const fundMilestoneBudget = (date: Date) => {
  const project = ProjectPool.pickProjectWithActiveMilestone(date, ProjectStatus.IN_PROGRESS);
  if (!project || !project.activeMilestone || !project.contract)
    return false;

  for (const milestone of project.milestones) {
    if (milestone.status !== MilestoneStatus.PENDING) {
      continue;
    }

    const hasMilestoneEscrowDeposit = TransactionPool.pickTransaction(
      TransactionType.ESCROW_DEPOSIT, TransactionStatus.SUCCESS, milestone.milestoneId).length > 0;

    if (hasMilestoneEscrowDeposit)
      return false;

    TransactionPool.depositEscrow(
      date, project.client,
      project.contract.budget * milestone.budgetRatio,
      milestone.milestoneId);
    milestone.fundStatus = FundStatus.DEPOSITED;
    milestone.updatedAt = date;
  }

  return true;
}
