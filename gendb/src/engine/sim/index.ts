import {
  installDate,
  simulationActionWeights,
  targetMinFinishedProject
} from "../config.js"
import {createAccount} from "./account.js";
import {
  clientRequestProjectTermination,
  createProject,
  ProjectPool,
  taskAutoPauseUncontractedProject,
  taskAutoTerminateProjectDueToClientRequest,
  taskAutoTerminateProjectDueToUnsignedContract,
  terminateProjectBeforeContract,
  unpauseProject
} from "./project.js";
import {chooseProposal, createProposal, withdrawProposal} from "./proposal.js";
import {makeDeposit, requestWithdrawal} from "./transaction.js";
import {signContract} from "./contract";
import {
  confirmWork,
  extendDeadline,
  fundMilestoneBudget,
  submitWork
} from "./milestone";

const interval = [1000 * 60 * 15, 1000 * 60 * 60];

export const Simulate = (callbackProgress: (progress: number) => void) => {
  let date = installDate();
  const actionCounts = new Map<string, number>([
    ['skip', 0],
    ['createAccount', 0],
    ['makeDeposit', 0],
    ['requestWithdrawal', 0],
    ['createProject', 0],
    ['createProposal', 0],
    ['unpauseProject', 0],
    ['terminateProjectBeforeContract', 0],
    ['withdrawProposal', 0],
    ['chooseProposal', 0],
    ['signContract', 0],
    ['submitWork', 0],
    ['confirmWork', 0],
    ['extendDeadline', 0],
    ['clientRequestProjectTermination', 0],
    ['fundMilestoneBudget', 0],
    ['taskAutoPauseUncontractedProject', 0],
    ['taskAutoTerminateProjectDueToUnsignedContract', 0],
    ['taskAutoTerminateProjectDueToClientRequest', 0]
  ]);
  const successActionCounts = new Map<string, number>();

  while (date < new Date()) {
    const progress = (date.getTime() - installDate().getTime()) / (new Date().getTime() - installDate().getTime());
    callbackProgress(progress);

    {
      const actions = [
        {
          action: taskAutoPauseUncontractedProject,
          name: 'taskAutoPauseUncontractedProject'
        },
        {
          action: taskAutoTerminateProjectDueToUnsignedContract,
          name: 'taskAutoTerminateProjectDueToUnsignedContract'
        },
        {
          action: taskAutoTerminateProjectDueToClientRequest,
          name: 'taskAutoTerminateProjectDueToClientRequest'
        }
      ] as { action: (date: Date) => any, name: string }[];

      for (const action of actions) {
        actionCounts.set(action.name, (actionCounts.get(action.name) || 0) + 1);

        const result = action.action(date);

        if (typeof result !== "boolean") {
          throw new Error(`Expected a boolean, but received ${typeof result} in action ${action.name}`);
        }

        if (result)
          successActionCounts.set(action.name, (successActionCounts.get(action.name) || 0) + 1);
      }

    }

    let projectActionBuff = 1;

    if (ProjectPool.countFinished() < targetMinFinishedProject()) {
      if (progress > 0.8)
        projectActionBuff = 8;
      else if (progress > 0.6)
        projectActionBuff = 4;
      else if (progress > 0.5)
        projectActionBuff = 2;
    }

    const actions = [
      {
        action: () => {
          return true;
        }, name: 'skip', weight: simulationActionWeights().skip
      },
      {
        action: createAccount,
        name: 'createAccount',
        weight: simulationActionWeights().createAccount
      },
      {
        action: createProject,
        name: 'createProject',
        weight: simulationActionWeights().createProject
      },
      {
        action: terminateProjectBeforeContract,
        name: 'terminateProjectBeforeContract',
        weight: simulationActionWeights().terminateProjectBeforeContract
      },
      {
        action: createProposal,
        name: 'createProposal',
        weight: simulationActionWeights().createProposal * projectActionBuff
      },
      {
        action: withdrawProposal,
        name: 'withdrawProposal',
        weight: simulationActionWeights().withdrawProposal * projectActionBuff
      },
      {
        action: makeDeposit,
        name: 'makeDeposit',
        weight: simulationActionWeights().makeDeposit
      },
      {
        action: requestWithdrawal,
        name: 'requestWithdrawal',
        weight: simulationActionWeights().requestWithdrawal
      },
      {
        action: chooseProposal,
        name: 'chooseProposal',
        weight: simulationActionWeights().chooseProposal * projectActionBuff
      },
      {
        action: signContract,
        name: 'signContract',
        weight: simulationActionWeights().signContract * projectActionBuff
      },
      {
        action: submitWork,
        name: 'submitWork',
        weight: simulationActionWeights().submitWork * projectActionBuff
      },
      {
        action: confirmWork,
        name: 'confirmWork',
        weight: simulationActionWeights().confirmWork * projectActionBuff
      },
      {
        action: unpauseProject,
        name: 'unpauseProject',
        weight: simulationActionWeights().unpauseProject
      },
      {
        action: extendDeadline,
        name: 'extendDeadline',
        weight: simulationActionWeights().extendDeadline
      },
      {
        action: fundMilestoneBudget,
        name: 'fundMilestoneBudget',
        weight: simulationActionWeights().fundMilestoneBudget
      },
      {
        action: clientRequestProjectTermination,
        name: 'clientRequestProjectTermination',
        weight: simulationActionWeights().clientRequestProjectTermination
      }
    ] as { action: (date: Date) => any, name: string, weight: number }[];

    const totalWeight = actions.reduce((sum, a) => sum + a.weight, 0);
    let random = Math.random() * totalWeight;

    let selectedAction = actions[0];
    for (const action of actions) {
      random -= action.weight;
      if (random <= 0) {
        selectedAction = action;
        break;
      }
    }

    actionCounts.set(selectedAction.name, (actionCounts.get(selectedAction.name) || 0) + 1);
    const result = selectedAction.action(date);

    if (typeof result !== "boolean") {
      throw new Error(`Expected a boolean, but received ${typeof result} in action ${selectedAction.name}`);
    }
    if (result)
      successActionCounts.set(selectedAction.name, (successActionCounts.get(selectedAction.name) || 0) + 1);

    date = new Date(date.getTime() + Math.floor(
      Math.random() * (interval[1] - interval[0] + 1) + interval[0]
    ));
  }

  return {actionCounts, successActionCounts};
}
