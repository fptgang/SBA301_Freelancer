import React from 'react';
import {Col, Form, Row} from 'react-bootstrap';
import {Controller, useForm} from 'react-hook-form';
import * as config from '../engine/config';
import bcrypt from 'bcryptjs';

type ConfigFormType = {
  installDate: Date;
  hashPass: string;
  depositAmount: typeof config.depositAmount;
  projectRequiredSkillAmount: typeof config.projectRequiredSkillAmount;
  profileRequiredSkillAmount: typeof config.profileRequiredSkillAmount;
  profileOverviewLineAmount: typeof config.profileOverviewLineAmount;
  projectDescriptionLineAmount: typeof config.projectDescriptionLineAmount;
  milestoneAmount: typeof config.milestoneAmount;
  milestoneDeadlineIncreaseDays: typeof config.milestoneDeadlineIncreaseDays;
  milestoneBudget: typeof config.milestoneBudget;
  depositEscrowOnDemand: typeof config.depositEscrowOnDemand;
  simulationActionWeights: typeof config.simulationActionWeights;
};

export const ConfigForm: React.FC = () => {
  const {control, setValue} = useForm<ConfigFormType>({
    defaultValues: {
      installDate: config.installDate(),
      hashPass: config.hashPass(),
      depositAmount: config.depositAmount(),
      projectRequiredSkillAmount: config.projectRequiredSkillAmount(),
      profileRequiredSkillAmount: config.profileRequiredSkillAmount(),
      profileOverviewLineAmount: config.profileOverviewLineAmount(),
      projectDescriptionLineAmount: config.projectDescriptionLineAmount(),
      milestoneAmount: config.milestoneAmount(),
      milestoneDeadlineIncreaseDays: config.milestoneDeadlineIncreaseDays(),
      milestoneBudget: config.milestoneBudget(),
      depositEscrowOnDemand: config.depositEscrowOnDemand(),
      simulationActionWeights: config.simulationActionWeights(),
    },
  });

  return (
    <Form className="p-3">
      <h3>Configuration Settings</h3>

      {/* Install Date */}
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
                console.log(newDate);
                config.setInstallDate(newDate);
              }}
              value={(() => {
                try {
                  return field.value.toISOString().slice(0, 16);
                } catch (e) {
                  return field.value; // Keep old value if error occurs
                }
              })()}
            />
          )}
        />
      </Form.Group>

      <hr className="my-4"/>

      {/* Pass */}
      <Form.Group className="mb-3">
        <Form.Label>Account Password</Form.Label>
        <Form.Control
          type="text"
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

      {/* Deposit Amount */}
      <Form.Group className="mb-3">
        <Form.Label>Deposit Amount Range</Form.Label>
        <Row>
          <Col>
            <Controller
              name="depositAmount.min"
              control={control}
              rules={{required: true, min: 0, max: 100000}}
              render={({field}) => (
                <Form.Control
                  type="number"
                  placeholder="Min"
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
              )}
            />
          </Col>
          <Col>
            <Controller
              name="depositAmount.max"
              control={control}
              rules={{required: true, min: 10}}
              render={({field}) => (
                <Form.Control
                  type="number"
                  placeholder="Max"
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
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      <hr className="my-4"/>

      {/* Project Required Skill Amount */}
      <Form.Group className="mb-3">
        <Form.Label>Project Required Skills Range</Form.Label>
        <Row>
          <Col>
            <Controller
              name="projectRequiredSkillAmount.min"
              control={control}
              rules={{required: true, min: 1}}
              render={({field}) => (
                <Form.Control
                  type="number"
                  placeholder="Min"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                    config.projectRequiredSkillAmount().min = Number(e.target.value);
                  }}
                />
              )}
            />
          </Col>
          <Col>
            <Controller
              name="projectRequiredSkillAmount.max"
              control={control}
              rules={{required: true, max: 10}}
              render={({field}) => (
                <Form.Control
                  type="number"
                  placeholder="Max"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                    config.projectRequiredSkillAmount().max = Number(e.target.value);
                  }}
                />
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      <hr className="my-4"/>

      {/* Profile Required Skill Amount */}
      <Form.Group className="mb-3">
        <Form.Label>Profile Required Skills Range</Form.Label>
        <Row>
          <Col>
            <Controller
              name="profileRequiredSkillAmount.min"
              control={control}
              rules={{required: true, min: 1}}
              render={({field}) => (
                <Form.Control
                  type="number"
                  placeholder="Min"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                    config.profileRequiredSkillAmount().min = Number(e.target.value);
                  }}
                />
              )}
            />
          </Col>
          <Col>
            <Controller
              name="profileRequiredSkillAmount.max"
              control={control}
              rules={{required: true, max: 10}}
              render={({field}) => (
                <Form.Control
                  type="number"
                  placeholder="Max"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                    config.profileRequiredSkillAmount().max = Number(e.target.value);
                  }}
                />
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      <hr className="my-4"/>

      {/* Profile Overview Line Amount */}
      <Form.Group className="mb-3">
        <Form.Label>Profile Overview Lines Range</Form.Label>
        <Row>
          <Col>
            <Controller
              name="profileOverviewLineAmount.min"
              control={control}
              rules={{required: true, min: 1}}
              render={({field}) => (
                <Form.Control
                  type="number"
                  placeholder="Min"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                    config.profileOverviewLineAmount().min = Number(e.target.value);
                  }}
                />
              )}
            />
          </Col>
          <Col>
            <Controller
              name="profileOverviewLineAmount.max"
              control={control}
              rules={{required: true, max: 100}}
              render={({field}) => (
                <Form.Control
                  type="number"
                  placeholder="Max"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                    config.profileOverviewLineAmount().max = Number(e.target.value);
                  }}
                />
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      <hr className="my-4"/>

      {/* Project Description Line Amount */}
      <Form.Group className="mb-3">
        <Form.Label>Project Description Lines Range</Form.Label>
        <Row>
          <Col>
            <Controller
              name="projectDescriptionLineAmount.min"
              control={control}
              rules={{required: true, min: 1}}
              render={({field}) => (
                <Form.Control
                  type="number"
                  placeholder="Min"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                    config.projectDescriptionLineAmount().min = Number(e.target.value);
                  }}
                />
              )}
            />
          </Col>
          <Col>
            <Controller
              name="projectDescriptionLineAmount.max"
              control={control}
              rules={{required: true, max: 100}}
              render={({field}) => (
                <Form.Control
                  type="number"
                  placeholder="Max"
                  {...field}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                    config.projectDescriptionLineAmount().max = Number(e.target.value);
                  }}
                />
              )}
            />
          </Col>
        </Row>
      </Form.Group>

      <hr className="my-4"/>

      {/* Milestone Budget Ranges */}
      <Form.Group className="mb-3">
        <Form.Label>Milestone Budget Ranges</Form.Label>
        {['Casual', 'Standard', 'Professional', 'Enterprise', 'Corporate'].map((level, index) => (
          <Row key={level} className="mb-2">
            <Form.Label>{level}</Form.Label>
            <Col>
              <Controller
                name={`milestoneBudget.${index}.min`}
                control={control}
                rules={{required: true, min: 0}}
                render={({field}) => (
                  <Form.Control
                    type="number"
                    placeholder="Min"
                    {...field}
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                      config.milestoneBudget()[index].min = Number(e.target.value);
                    }}
                  />
                )}
              />
            </Col>
            <Col>
              <Controller
                name={`milestoneBudget.${index}.max`}
                control={control}
                rules={{required: true}}
                render={({field}) => (
                  <Form.Control
                    type="number"
                    placeholder="Max"
                    {...field}
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                      config.milestoneBudget()[index].max = Number(e.target.value);
                    }}
                  />
                )}
              />
            </Col>
          </Row>
        ))}
      </Form.Group>

      <hr className="my-4"/>

      {/* Deposit Escrow On Demand */}
      <Form.Group className="mb-3">
        <Form.Label>Deposit Escrow Probability</Form.Label>
        <Controller
          name="depositEscrowOnDemand.probability"
          control={control}
          rules={{required: true, min: 0, max: 1}}
          render={({field}) => (
            <Form.Control
              type="number"
              step="0.1"
              {...field}
              onChange={(e) => {
                field.onChange(Number(e.target.value));
                config.depositEscrowOnDemand().probability = Number(e.target.value);
              }}
            />
          )}
        />
      </Form.Group>

      <hr className="my-4"/>

      {/* Simulation Action Weights */}
      <Form.Group className="mb-3">
        <Form.Label>Simulation Action Weights</Form.Label>
        {Object.entries(config.simulationActionWeights()).map(([action, weight]) => (
          <Row key={action} className="mb-2">
            <Col xs={4}>
              <Form.Label>{action}</Form.Label>
            </Col>
            <Col>
              <Controller
                name={`simulationActionWeights.${action}`}
                control={control}
                rules={{required: true, min: 0}}
                render={({field}) => (
                  <Form.Control
                    type="number"
                    {...field}
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                      (config.simulationActionWeights() as any)[action] = Number(e.target.value);
                    }}
                  />
                )}
              />
            </Col>
          </Row>
        ))}
      </Form.Group>
    </Form>
  );
};
