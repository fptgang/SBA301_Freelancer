import {escapeSingleQuotes} from "../utils.js";
import {MilestoneStatus} from "./MilestoneStatus.js";

export class Milestone {
  milestoneId: number;
  budget: number;
  createdAt: Date | null;
  deadline: Date;
  isVisible: boolean;
  status: MilestoneStatus;
  title: string;
  updatedAt: Date | null;
  projectId: number;

  constructor(
    milestoneId: number,
    budget: number,
    deadline: Date,
    status: MilestoneStatus,
    title: string,
    projectId: number,
    isVisible: boolean = true,
    createdAt: Date | null = null,
    updatedAt: Date | null = null
  ) {
    this.milestoneId = milestoneId;
    this.budget = budget;
    this.deadline = deadline;
    this.isVisible = isVisible;
    this.status = status;
    this.title = title;
    this.projectId = projectId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static dump(milestones: Milestone[]): string {
    if (milestones.length === 0) return '';

    const columns = [
      'milestone_id',
      'budget',
      'created_at',
      'deadline',
      'is_visible',
      'status',
      'title',
      'updated_at',
      'project_id'
    ];

    const values = milestones.map(milestone => {
      const formatDate = (date: Date | null) =>
        date ? `'${date.toISOString().slice(0, 19).replace('T', ' ')}.000000'` : 'NULL';

      return `(${milestone.milestoneId},` +
        `${milestone.budget.toFixed(2)},` +
        `${formatDate(milestone.createdAt)},` +
        `${formatDate(milestone.deadline)},` +
        `${milestone.isVisible ? 1 : 0},` +
        `'${milestone.status}',` +
        `'${escapeSingleQuotes(milestone.title)}',` +
        `${formatDate(milestone.updatedAt)},` +
        `${milestone.projectId})`;
    }).join(',\n');

    return `INSERT INTO milestones (${columns.join(', ')}) VALUES\n${values};`;
  }
}