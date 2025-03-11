import {escapeSingleQuotes} from "../utils.js";
import {MilestoneStatus} from "./MilestoneStatus.js";
import {FundStatus} from "./FundStatus.js";

export class Milestone {
  milestoneId: number;
  budgetRatio: number;
  createdAt: Date | null;
  deadline: Date;
  isVisible: boolean;
  status: MilestoneStatus;
  fundStatus: FundStatus;
  title: string;
  description: string | null;
  updatedAt: Date | null;
  projectId: number;

  constructor(
    milestoneId: number,
    budgetRatio: number,
    deadline: Date,
    status: MilestoneStatus,
    fundStatus: FundStatus,
    title: string,
    description: string | null,
    projectId: number,
    isVisible: boolean = true,
    createdAt: Date | null = null,
    updatedAt: Date | null = null
  ) {
    this.milestoneId = milestoneId;
    this.budgetRatio = budgetRatio;
    this.deadline = deadline;
    this.isVisible = isVisible;
    this.status = status;
    this.fundStatus = fundStatus;
    this.title = title;
    this.description = description;
    this.projectId = projectId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static dump(milestones: Milestone[]): string {
    if (milestones.length === 0) return '';

    const columns = [
      'milestone_id',
      'budget_ratio',
      'created_at',
      'deadline',
      'is_visible',
      'status',
      'fund_status',
      'title',
      'description',
      'updated_at',
      'project_id'
    ];

    const values = milestones.map(milestone => {
      const formatDate = (date: Date | null) =>
        date ? `'${date.toISOString().slice(0, 19).replace('T', ' ')}.000000'` : 'NULL';

      return `(${milestone.milestoneId},` +
        `${milestone.budgetRatio.toFixed(2)},` +
        `${formatDate(milestone.createdAt)},` +
        `${formatDate(milestone.deadline)},` +
        `${milestone.isVisible ? 1 : 0},` +
        `'${milestone.status}',` +
        `'${milestone.fundStatus}',` +
        `'${escapeSingleQuotes(milestone.title)}',` +
        (milestone.description ? `'${escapeSingleQuotes(milestone.description)}'` : `NULL`) + `,` +
        `${formatDate(milestone.updatedAt)},` +
        `${milestone.projectId})`;
    }).join(',\n');

    return `INSERT INTO milestones (${columns.join(', ')}) VALUES\n${values};`;
  }
}