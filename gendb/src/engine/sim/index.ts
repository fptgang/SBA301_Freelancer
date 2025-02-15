import {installDate, simulationActionWeights} from "../config.js"
import {createAccount} from "./account.js";
import {completeMilestone, createProject, startMilestone} from "./project.js";
import {chooseProposal, createProposal} from "./proposal.js";
import {makeDeposit, requestWithdrawal} from "./transaction.js";

const interval = [1000 * 60 * 30, 1000 * 60 * 60 * 3];

export const Simulate = (callbackProgress: (progress: number) => void) => {
  let date = installDate();
  const actionCounts = new Map<string, number>();
  actionCounts.set('skip', 0);
  actionCounts.set('createAccount', 0);
  actionCounts.set('createProject', 0);
  actionCounts.set('createProposal', 0);
  actionCounts.set('makeDeposit', 0);
  actionCounts.set('requestWithdrawal', 0);
  actionCounts.set('chooseProposal', 0);
  actionCounts.set('startMilestone', 0);
  actionCounts.set('completeMilestone', 0);

  while (date < new Date()) {
    const progress = (date.getTime() - installDate().getTime()) / (new Date().getTime() - installDate().getTime());
    callbackProgress(progress);

    const actions = [
      {
        action: () => {
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
        action: createProposal,
        name: 'createProposal',
        weight: simulationActionWeights().createProposal
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
        weight: simulationActionWeights().chooseProposal
      },
      {
        action: startMilestone,
        name: 'startMilestone',
        weight: simulationActionWeights().startMilestone
      },
      {
        action: completeMilestone,
        name: 'completeMilestone',
        weight: simulationActionWeights().completeMilestone
      }
    ];

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
    selectedAction.action(date);

    date = new Date(date.getTime() + Math.floor(
      Math.random() * (interval[1] - interval[0] + 1) + interval[0]
    ));
  }

  console.log('\nAction execution counts:');
  actionCounts.forEach((count, action) => {
    console.log(`${action}: ${count}`);
  });
}
