```
seed: 
- project categories
- skills

simulation:
- create account
  if freelancer -> create profile, profile skills
- create project -> create milestones
                 -> project required skills
- create proposal
- make deposit
- request withdrawal

dump order
    account
    files
    messages
    milestones
    profile_skills
    profiles
    project_categories [x]
    project_required_skills
    projects
    proposals
    refresh_token
    skills [x]
    transactions

write a typescript class to present the table using the appropriate typescript data types
then, write a static dump() function that accept an array of model objects and print out SQL command that bulk insert. Remember, format the value as appropriate to let it work with the data type declared in table fields
For ID (primary key and foreign key), in the typescript model, should be number
do not write the examples
export all
```