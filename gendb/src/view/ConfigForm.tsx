import React from 'react';
import {Col, Form, Row} from 'react-bootstrap';
import {Controller, useForm} from 'react-hook-form';
import * as config from '../engine/config';
import bcrypt from 'bcryptjs';

type ConfigFormType = {
  installDate: Date;
  hashPass: string;
  depositAmount: typeof config.depositAmount;
  projectBudget: typeof config.projectBudget;
  projectStartDayDelay: typeof config.projectStartDayDelay;
  projectRequiredSkillAmount: typeof config.projectRequiredSkillAmount;
  profileRequiredSkillAmount: typeof config.profileRequiredSkillAmount;
  profileOverviewLineAmount: typeof config.profileOverviewLineAmount;
  projectDescriptionLineAmount: typeof config.projectDescriptionLineAmount;
  projectFileAmount: typeof config.projectFileAmount;
  milestoneDeliverableFileAmount: typeof config.milestoneDeliverableFileAmount;
  proposalFileAmount: typeof config.proposalFileAmount;
  milestoneAmount: typeof config.milestoneAmount;
  milestoneDescriptionLineAmount: typeof config.milestoneDescriptionLineAmount;
  milestoneDeadlineIncreaseDays: typeof config.milestoneDeadlineIncreaseDays;
  simulationActionWeights: typeof config.simulationActionWeights;
  targetMinFinishedProject: typeof config.targetMinFinishedProject;
};

export const ConfigForm: React.FC = () => {
  const {control, setValue} = useForm<ConfigFormType>({
    defaultValues: {
      installDate: config.installDate(),
      hashPass: config.hashPass(),
      depositAmount: config.depositAmount(),
      projectBudget: config.projectBudget(),
      projectStartDayDelay: config.projectStartDayDelay(),
      projectRequiredSkillAmount: config.projectRequiredSkillAmount(),
      profileRequiredSkillAmount: config.profileRequiredSkillAmount(),
      profileOverviewLineAmount: config.profileOverviewLineAmount(),
      projectDescriptionLineAmount: config.projectDescriptionLineAmount(),
      projectFileAmount: config.projectFileAmount(),
      milestoneDeliverableFileAmount: config.milestoneDeliverableFileAmount(),
      proposalFileAmount: config.proposalFileAmount(),
      milestoneAmount: config.milestoneAmount(),
      milestoneDescriptionLineAmount: config.milestoneDescriptionLineAmount(),
      milestoneDeadlineIncreaseDays: config.milestoneDeadlineIncreaseDays(),
      simulationActionWeights: config.simulationActionWeights(),
      targetMinFinishedProject: config.targetMinFinishedProject(),
    },
  });

  return (
    <Form className="p-3">
      <h3>Configuration Settings</h3>

      {/* System Settings Section */}
      <h5>System Settings</h5>
      <Form.Group className="mb-3">
        <Form.Label>Install Date</Form.Label>
        <Controller
          name="installDate"
          control={control}
          rules={{required: true}}
          render={({field}) => (
            <Form.Control
              type="datetime-local"
              {...field}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                field.onChange(newDate);
                config.setInstallDate(newDate);
              }}
              value={(() => {
                try {
                  return field.value.toISOString().slice(0, 16);
                } catch (e) {
                  return field.value;
                }
              })()}
            />
          )}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Account Password</Form.Label>
        <Form.Control
          placeholder="Enter password"
          type="password"
          onChange={(e) => {
            const hash = bcrypt.hashSync(e.target.value);
            config.setHashPass(hash);
            setValue('hashPass', hash);
          }}
        />
      </Form.Group>

      {/* Hash Pass */}
      <Form.Group className="mb-3">
        <Form.Label>Hash Pass</Form.Label>
        <Controller
          name="hashPass"
          control={control}
          rules={{required: true, pattern: /^\$2a\$10\$.+/}}
          render={({field}) => (
            <Form.Control
              type="text"
              {...field}
              readOnly
            />
          )}
        />
      </Form.Group>

      <hr className="my-4"/>

      {/* Project Settings Section */}
      <h5>Project Settings</h5>
      <Form.Group className="mb-3">
        <Form.Label>Project Budget Range ($)</Form.Label>
        <Row>
          <Col>
            <Controller
              name="projectBudget.min"
              control={control}
              rules={{
                required: true,
                min: 10,
                validate: (value) => value < control._formValues.projectBudget.max
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Min"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setProjectBudget({
                        ...config.projectBudget(),
                        min: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be at least $10 and less than maximum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
          <Col>
            <Controller
              name="projectBudget.max"
              control={control}
              rules={{
                required: true,
                validate: (value) => value > control._formValues.projectBudget.min
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Max"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setProjectBudget({
                        ...config.projectBudget(),
                        max: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be greater than minimum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      <hr className="my-4"/>

      {/* Milestone Settings Section */}
      <h5>Milestone Settings</h5>
      <Form.Group className="mb-3">
        <Form.Label>Milestone Amount Range</Form.Label>
        <Row>
          <Col>
            <Controller
              name="milestoneAmount.min"
              control={control}
              rules={{
                required: true,
                min: 1,
                validate: (value) => value < control._formValues.milestoneAmount.max
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Min"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setMilestoneAmount({
                        ...config.milestoneAmount(),
                        min: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be at least 1 and less than maximum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
          <Col>
            <Controller
              name="milestoneAmount.max"
              control={control}
              rules={{
                required: true,
                max: 10,
                validate: (value) => value > control._formValues.milestoneAmount.min
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Max"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setMilestoneAmount({
                        ...config.milestoneAmount(),
                        max: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be less than 10 and greater than minimum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      <hr className="my-4"/>

      {/* Simulation Settings Section */}
      <h5>Simulation Settings</h5>
      <Form.Group className="mb-3">
        <Form.Label>Target Minimum Finished Projects</Form.Label>
        <Controller
          name="targetMinFinishedProject"
          control={control}
          rules={{
            required: true,
            min: 1
          }}
          render={({field, fieldState}) => (
            <>
              <Form.Control
                type="number"
                isInvalid={!!fieldState.error}
                {...field}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  field.onChange(value);
                  config.setTargetMinFinishedProject(value);
                }}
              />
              {fieldState.error && (
                <Form.Text className="text-danger">
                  Must be at least 1
                </Form.Text>
              )}
            </>
          )}
        />
      </Form.Group>

      {/* Project Timeline Settings */}
      <Form.Group className="mb-3">
        <Form.Label>Project Start Delay (Days)</Form.Label>
        <Row>
          <Col>
            <Controller
              name="projectStartDayDelay.min"
              control={control}
              rules={{
                required: true,
                min: 3,
                validate: (value) => value < control._formValues.projectStartDayDelay.max
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Min days"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setProjectStartDayDelay({
                        ...config.projectStartDayDelay(),
                        min: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be at least 3 day and less than maximum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
          <Col>
            <Controller
              name="projectStartDayDelay.max"
              control={control}
              rules={{
                required: true,
                max: 30,
                validate: (value) => value > control._formValues.projectStartDayDelay.min
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Max days"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setProjectStartDayDelay({
                        ...config.projectStartDayDelay(),
                        max: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be less than 30 days and greater than minimum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      {/* Project Requirements Section */}
      <h5 className="mt-4">Project Requirements</h5>

      <Form.Group className="mb-3">
        <Form.Label>Required Skills</Form.Label>
        <Row>
          <Col>
            <Controller
              name="projectRequiredSkillAmount.min"
              control={control}
              rules={{
                required: true,
                min: 1,
                validate: (value) => value < control._formValues.projectRequiredSkillAmount.max
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Min skills"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setProjectRequiredSkillAmount({
                        ...config.projectRequiredSkillAmount(),
                        min: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be at least 1 and less than maximum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
          <Col>
            <Controller
              name="projectRequiredSkillAmount.max"
              control={control}
              rules={{
                required: true,
                max: 10,
                validate: (value) => value > control._formValues.projectRequiredSkillAmount.min
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Max skills"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setProjectRequiredSkillAmount({
                        ...config.projectRequiredSkillAmount(),
                        max: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be less than 10 and greater than minimum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      {/* Description Settings */}
      <Form.Group className="mb-3">
        <Form.Label>Project Description Length (Lines)</Form.Label>
        <Row>
          <Col>
            <Controller
              name="projectDescriptionLineAmount.min"
              control={control}
              rules={{
                required: true,
                min: 3,
                validate: (value) => value < control._formValues.projectDescriptionLineAmount.max
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Min lines"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setProjectDescriptionLineAmount({
                        ...config.projectDescriptionLineAmount(),
                        min: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be at least 3 lines and less than maximum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
          <Col>
            <Controller
              name="projectDescriptionLineAmount.max"
              control={control}
              rules={{
                required: true,
                max: 100,
                validate: (value) => value > control._formValues.projectDescriptionLineAmount.min
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Max lines"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setProjectDescriptionLineAmount({
                        ...config.projectDescriptionLineAmount(),
                        max: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be less than 100 lines and greater than minimum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      {/* Escrow Settings */}
      <h5 className="mt-4">Escrow Settings</h5>

      <Form.Group className="mb-3">
        <Form.Label>Deposit Amount ($)</Form.Label>
        <Row>
          <Col>
            <Controller
              name="depositAmount.min"
              control={control}
              rules={{
                required: true,
                min: 10,
                validate: (value) => value < control._formValues.depositAmount.max
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Min deposit"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setDepositAmount({
                        ...config.depositAmount(),
                        min: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be at least $10 and less than maximum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
          <Col>
            <Controller
              name="depositAmount.max"
              control={control}
              rules={{
                required: true,
                validate: (value) => value > control._formValues.depositAmount.min
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Max deposit"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setDepositAmount({
                        ...config.depositAmount(),
                        max: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be greater than minimum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
        </Row>
      </Form.Group>


      {/* File Settings Section */}
      <h5 className="mt-4">File Settings</h5>

      <Form.Group className="mb-3">
        <Form.Label>Project Files</Form.Label>
        <Row>
          <Col>
            <Controller
              name="projectFileAmount.min"
              control={control}
              rules={{
                required: true,
                min: 0,
                validate: (value) => value < control._formValues.projectFileAmount.max
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Min files"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setProjectFileAmount({
                        ...config.projectFileAmount(),
                        min: value
                      });
                    }}

                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be at least 0 and less than maximum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
          <Col>
            <Controller
              name="projectFileAmount.max"
              control={control}
              rules={{
                required: true,
                max: 10,
                validate: (value) => value > control._formValues.projectFileAmount.min
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Max files"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setProjectFileAmount({
                        ...config.projectFileAmount(),
                        max: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be less than 10 and greater than minimum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Milestone Deliverable Files</Form.Label>
        <Row>
          <Col>
            <Controller
              name="milestoneDeliverableFileAmount.min"
              control={control}
              rules={{
                required: true,
                min: 1,
                validate: (value) => value < control._formValues.milestoneDeliverableFileAmount.max
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Min files"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setMilestoneDeliverableFileAmount({
                        ...config.milestoneDeliverableFileAmount(),
                        min: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be at least 1 and less than maximum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
          <Col>
            <Controller
              name="milestoneDeliverableFileAmount.max"
              control={control}
              rules={{
                required: true,
                max: 5,
                validate: (value) => value > control._formValues.milestoneDeliverableFileAmount.min
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Max files"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setMilestoneDeliverableFileAmount({
                        ...config.milestoneDeliverableFileAmount(),
                        max: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be less than 5 and greater than minimum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Proposal Files</Form.Label>
        <Row>
          <Col>
            <Controller
              name="proposalFileAmount.min"
              control={control}
              rules={{
                required: true,
                min: 0,
                validate: (value) => value < control._formValues.proposalFileAmount.max
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Min files"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setProposalFileAmount({
                        ...config.proposalFileAmount(),
                        min: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be at least 0 and less than maximum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
          <Col>
            <Controller
              name="proposalFileAmount.max"
              control={control}
              rules={{
                required: true,
                max: 10,
                validate: (value) => value > control._formValues.proposalFileAmount.min
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Max files"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setProposalFileAmount({
                        ...config.proposalFileAmount(),
                        max: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be less than 10 and greater than minimum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      {/* Profile Settings Section */}
      <h5 className="mt-4">Profile Settings</h5>

      <Form.Group className="mb-3">
        <Form.Label>Required Skills</Form.Label>
        <Row>
          <Col>
            <Controller
              name="profileRequiredSkillAmount.min"
              control={control}
              rules={{
                required: true,
                min: 1,
                validate: (value) => value < control._formValues.profileRequiredSkillAmount.max
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Min skills"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setProfileRequiredSkillAmount({
                        ...config.profileRequiredSkillAmount(),
                        min: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be at least 1 and less than maximum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
          <Col>
            <Controller
              name="profileRequiredSkillAmount.max"
              control={control}
              rules={{
                required: true,
                max: 10,
                validate: (value) => value > control._formValues.profileRequiredSkillAmount.min
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Max skills"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setProfileRequiredSkillAmount({
                        ...config.profileRequiredSkillAmount(),
                        max: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be less than 10 and greater than minimum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Profile Overview Length (Lines)</Form.Label>
        <Row>
          <Col>
            <Controller
              name="profileOverviewLineAmount.min"
              control={control}
              rules={{
                required: true,
                min: 2,
                validate: (value) => value < control._formValues.profileOverviewLineAmount.max
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Min lines"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setProfileOverviewLineAmount({
                        ...config.profileOverviewLineAmount(),
                        min: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be at least 2 lines and less than maximum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
          <Col>
            <Controller
              name="profileOverviewLineAmount.max"
              control={control}
              rules={{
                required: true,
                max: 50,
                validate: (value) => value > control._formValues.profileOverviewLineAmount.min
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Max lines"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setProfileOverviewLineAmount({
                        ...config.profileOverviewLineAmount(),
                        max: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be less than 50 lines and greater than minimum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      {/* Milestone Settings Section */}
      <h5 className="mt-4">Additional Milestone Settings</h5>

      <Form.Group className="mb-3">
        <Form.Label>Milestone Description Length (Lines)</Form.Label>
        <Row>
          <Col>
            <Controller
              name="milestoneDescriptionLineAmount.min"
              control={control}
              rules={{
                required: true,
                min: 1,
                validate: (value) => value < control._formValues.milestoneDescriptionLineAmount.max
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Min lines"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setMilestoneDescriptionLineAmount({
                        ...config.milestoneDescriptionLineAmount(),
                        min: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be at least 1 line and less than maximum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
          <Col>
            <Controller
              name="milestoneDescriptionLineAmount.max"
              control={control}
              rules={{
                required: true,
                max: 30,
                validate: (value) => value > control._formValues.milestoneDescriptionLineAmount.min
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Max lines"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setMilestoneDescriptionLineAmount({
                        ...config.milestoneDescriptionLineAmount(),
                        max: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be less than 30 lines and greater than minimum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Milestone Deadline Increase (Days)</Form.Label>
        <Row>
          <Col>
            <Controller
              name="milestoneDeadlineIncreaseDays.min"
              control={control}
              rules={{
                required: true,
                min: 3,
                validate: (value) => value < control._formValues.milestoneDeadlineIncreaseDays.max
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Min days"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setMilestoneDeadlineIncreaseDays({
                        ...config.milestoneDeadlineIncreaseDays(),
                        min: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be at least 3 day and less than maximum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
          <Col>
            <Controller
              name="milestoneDeadlineIncreaseDays.max"
              control={control}
              rules={{
                required: true,
                max: 30,
                validate: (value) => value > control._formValues.milestoneDeadlineIncreaseDays.min
              }}
              render={({field, fieldState}) => (
                <>
                  <Form.Control
                    type="number"
                    placeholder="Max days"
                    isInvalid={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      field.onChange(value);
                      config.setMilestoneDeadlineIncreaseDays({
                        ...config.milestoneDeadlineIncreaseDays(),
                        max: value
                      });
                    }}
                  />
                  {fieldState.error && (
                    <Form.Text className="text-danger">
                      Must be less than 30 days and greater than minimum
                    </Form.Text>
                  )}
                </>
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      {/* Simulation Action Weights Section */}
      <h5 className="mt-4">Simulation Action Weights</h5>

      {Object.entries(config.simulationActionWeights()).map(([action, weight]) => (
        <Form.Group key={action} className="mb-2">
          <Row>
            <Col xs={4}>
              <Form.Label className="text-capitalize">
                {action.replace(/([A-Z])/g, ' $1').trim()}
              </Form.Label>
            </Col>
            <Col>
              <Controller
                name={`simulationActionWeights.${action}`}
                control={control}
                rules={{
                  required: true,
                  min: 0,
                  max: 1000
                }}
                render={({field, fieldState}) => (
                  <>
                    <Form.Control
                      type="number"
                      placeholder="Weight"
                      isInvalid={!!fieldState.error}
                      {...field}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        field.onChange(value);
                        config.setSimulationActionWeights({
                          ...config.simulationActionWeights(),
                          [action]: value
                        });
                      }}
                    />
                    {fieldState.error && (
                      <Form.Text className="text-danger">
                        Must be between 0 and 1000
                      </Form.Text>
                    )}
                  </>
                )}
              />
            </Col>
          </Row>
        </Form.Group>
      ))}
    </Form>
  );
};
