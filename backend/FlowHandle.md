# Project

## CREATE
  - StartDate must be at least 3 days later (from the time of project creation)
  - The distance between milestones is at least 3 days (and up to 30 days) and the deadlines for milestones are in ascending order
  - The maximum amount of milestones is 10
  - Project Status is OPEN

## UPDATE
### If status is OPEN
  - Can change any settings
  - Create, modify or remove milestones according to rules above
### If status is IN PROGRESS
  - Can extend deadline IF the project has activeMilestone (implying the contract is made and SIGNED), current activeMilestone is late (current date is after deadline), the project is not meant to be terminated
    - Can only extend the deadline of current activeMilestones and future milestones according to rules above
    - Cannot change startDate or anything else settings on projects or milestones
    - Note: The second condition (current activeMilestone is late) is enforced to avoid client abusing and wasting freelancer time

## Terminate
- Can terminate project IF its status is OPEN with reason OTHER
  - All milestone status becomes TERMINATED
  - No refund is made because it does not exist
- Can schedule to terminate project IF its status is IN_PROGRESS with an activeMilestone (indicating a contract has been made) and at least 2 days before the current milestone deadline
  - The project is NOT immediately terminated but to-be-terminated at the end of the current milestone deadline

## Unpause
- Can unpause project IF its status is PAUSED
    - Must adjust startDate and milestones deadlines according to rules above
    - Unpause changes the project status to OPEN

# Proposal
## CREATE
- The target project must have status OPEN
- A freelancer can only have up to 1 proposal (per project) whose status is either ACCEPTED or PENDING

## UPDATE
- Cannot update the details of existing proposal

## Withdraw
- Freelancer can withdraw his proposal IF project status is OPEN, turns its status into WITHDRAWN

## Accept
- The client can accept a proposal IF project status is OPEN
  - He must deposit the first milestone budget into the escrow. A transaction with type ESCROW_DEPOSIT is made (must be SUCCESS) 
  - Except the chosen proposal, all remaining PENDING proposals are REJECTED
  - A contract is created
  - No active milestone in project
  - The project status is IN_PROGRESS
  - All milestone status are PENDING

## Reject
- The client can reject an individual proposal IF project status is OPEN

# Contract
## UPDATE
- Cannot update (immutable)

## Sign
- The freelancer can sign a contract IF project status is IN_PROGRESS. If a contract is signed successfully:
  - The first milestone status is IN_PROGRESS
  - The first milestone becomes activeMilestone

# Milestone
## CREATE, UPDATE
- See: Project

## SubmitWork
- The freelancer can submit work if there is an activeMilestone (implying a contract is made and signed) and its status is either IN_PROGRESS or REVIEWING
  - The current milestone status becomes REVIEWING if it is currently IN_PROGRESS
  - The freelancer can submit or remove works multiple times during REVIEWING

## ConfirmWork
- The client can confirm work if there is an activeMilestone (implying a contract is made and signed) and its status is REVIEWING
  - If no SUCCESS ESCROW_DEPOSIT transaction is made to the next milestone, he must deposit the next milestone budget into the escrow (must be SUCCESS)
    - Note: He might have deposited fund ahead-of-time
  - The current milestone budget is moved from escrow to freelancer (ESCROW_RELEASE, must be SUCCESS) if not exist yet (avoid duplication)
  - The current activeMilestone status becomes FINISHED
  - If there exists the next milestone
    - The next milestone becomes activeMilestone
    - The next milestone status becomes IN_PROGRESS
  - Otherwise
    - The project status becomes FINISHED

## DepositFund
- At any time, the client can fund future milestone budgets. They must be consecutive and in order. In other words, the only eligible milestone to pay for is the next one after the furthest milestone has been paid

# Scheduled Tasks
## Task 1: Pause project due to no proposal chosen (no contract is made) at 1 day before startDate
- Condition: 
  - `CurrentDate >= StartDate - 1d`
  - The project status remains OPEN
  - No proposal is chosen
  - No contract is made
  - All milestones remains PENDING
- Action:
  - Set project status to PAUSED
  - Set all proposals status into EXPIRED

## Task 2: Terminate project due to unsigned contract at startDate
- Condition:
    - `CurrentDate >= StartDate - 1d`
    - The project status is IN_PROGRESS
    - A contract is made with status UNSIGNED
- Action:
  - Terminate project with reason CONTRACT_UNSIGNED
  - All milestone status becomes TERMINATED
  - Do NOT update contract status
  - Do NOT change activeMilestone (still NULL for now)
  - Refund the client the first milestone budget. A transaction with type ESCROW_REFUND is made (must be SUCCESS)

## Task 3: Terminate project due to client requested
- Condition:
  - The project was meant to be terminated
- Action:
  - Terminate project with reason CLIENT_REQUEST_TERMINATION
  - The current milestone budget is moved from escrow to freelancer (ESCROW_RELEASE, must be SUCCESS)
  - All future PENDING milestone's budgets (if exist) are moved from escrow to client (ESCROW_REFUND, must be SUCCESS)
  - The current milestone status becomes TERMINATED
  - All PENDING milestone status becomes TERMINATED
  - Do NOT update contract status
  - Do NOT change activeMilestone

# Staff Intervention
- The client or freelancer can contact staff in project at any time if the project is IN_PROGRESS
- The staff can terminate the project immediately with reason STAFF_DECISION:
  - For the current milestone fund, he decides whether to pay the freelancer or refund to the client
  - All future PENDING milestone's budgets (if exist) are refunded to client


```java
public enum MilestoneStatus{PENDING,TERMINATED,IN_PROGRESS,REVIEWING,FINISHED}
public enum ProposalStatus{PENDING,EXPIRED,WITHDRAWN,ACCEPTED,REJECTED}
public enum ContractStatus{UNSIGNED,SIGNED,TERMINATED}
public enum ProjectTerminationReason{OTHER,CONTRACT_UNSIGNED,CLIENT_REQUEST_TERMINATION,STAFF_DECISION}
public enum ProjectStatus{OPEN,PAUSED,IN_PROGRESS,TERMINATED,FINISHED}
public enum TransactionType{DEPOSIT,WITHDRAWAL,ESCROW_DEPOSIT,ESCROW_RELEASE,ESCROW_REFUND}
```