import React, {useEffect, useState} from 'react';
import {Col, Container, Row, Spinner} from 'react-bootstrap';
import {ConfigForm} from './ConfigForm';
import {SqlFileAppender} from "../engine/appender.js";
import {DumpCategories, ResetCategories} from "../engine/seed/CategoryDump.js";
import {DumpSkills, ResetSkills} from "../engine/seed/SkillDump.js";
import {
  AccountPool,
  DumpAccounts,
  ResetAccountPool
} from "../engine/sim/account.js";
import {Simulate} from "../engine/sim/index.js";
import {
  DumpProjects,
  ProjectPool,
  ResetProjectPool
} from "../engine/sim/project.js";
import {
  DumpProposals,
  ProposalPool,
  ResetProposalPool
} from "../engine/sim/proposal.js";
import {
  DumpTransactions,
  ResetTransactionPool,
  TransactionPool
} from "../engine/sim/transaction.js";
import toast from 'react-hot-toast';
import {
  DumpProfiles,
  ProfilePool,
  ResetProfilePool
} from '../engine/sim/profile.js';
import {DumpFiles, FilePool, ResetFilePool} from '../engine/sim/file.js';
import {
  ContractPool,
  DumpContracts,
  ResetContractPool
} from "../engine/sim/contract";

const Home: React.FC = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generateTime, setGenerateTime] = useState<number | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [count, setCount] = useState<Map<string, number>>(new Map());
  const [actionCounts, setActionCounts] = useState<Map<string, number>>(new Map());
  const [successActionCounts, setSuccessActionCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    SqlFileAppender.setInMemoryMode(true);
  }, []);

  return (
    <Container className="py-5">
      <Row>
        <Col md={6}>
          <ConfigForm/>
        </Col>
        <Col md={6}>
          <div>
            <h4>How to use?</h4>
            <p>
              <ul>
                <li>1. Click the "Generate" button.</li>
                <li>2. Download SQL file</li>
                <li>3. In IntelliJ, select the database</li>
                <li>4. Click SQL Scripts -&gt; Run SQL Script</li>
              </ul>
            </p>
          </div>
          <div className="mb-3 d-flex gap-3">
            <button
              className="btn btn-primary me-2"
              disabled={isLoading}
              onClick={() => {
                setIsLoading(true);
                setProgress(0);

                async function generate() {
                  await new Promise(resolve => setTimeout(resolve, 100));
                  console.clear()
                  const startTime = performance.now();

                  ResetFilePool();
                  ResetCategories();
                  ResetSkills();
                  ResetAccountPool();
                  ResetProfilePool();
                  ResetTransactionPool();
                  ResetProjectPool();
                  ResetProposalPool();
                  ResetContractPool();

                  SqlFileAppender.prepare();
                  DumpCategories();
                  DumpSkills();
                  const {
                    actionCounts,
                    successActionCounts
                  } = Simulate(function (progress: number) {
                    setProgress(progress);
                  });
                  setActionCounts(actionCounts);
                  setSuccessActionCounts(successActionCounts);
                  DumpAccounts();
                  DumpContracts();
                  DumpProfiles();
                  DumpTransactions();
                  DumpProjects(); // including milestones and project_skills
                  DumpProposals();
                  DumpFiles();

                  setCount(new Map([
                    ['account', AccountPool.count()],
                    ['contract', ContractPool.count()],
                    ['file', FilePool.count()],
                    ['profile', ProfilePool.count()],
                    ['project', ProjectPool.count()],
                    ['proposal', ProposalPool.count()],
                    ['transaction', TransactionPool.count()],
                  ]));

                  const endTime = performance.now();
                  setGenerateTime(endTime - startTime);
                  setCode(SqlFileAppender.getBuffer().join('\n'));
                  setIsLoading(false);
                }

                generate();
              }}
            >
              Generate
            </button>
            <button
              className="btn btn-secondary"
              disabled={!code}
              onClick={() => {
                const blob = new Blob([code], {type: 'text/plain'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'generated.sql';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success('Downloaded SQL!');
              }}
            >
              Download SQL
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                navigator.clipboard.writeText(code);
                toast.success('Copied to clipboard!');
              }}
            >
              Copy SQL
            </button>
          </div>

          <div className="progress mb-2">
            <div
              className="progress-bar"
              role="progressbar"
              style={{width: `${progress * 100}%`}}
              aria-valuenow={progress * 100}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {(progress * 100).toFixed(0)}%
            </div>
          </div>
          {generateTime && (
            <span className="ms-2">
              Generation time: {generateTime.toFixed(2)}ms
            </span>
          )}
          {isLoading ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <>
              <div className="mb-3 d-flex gap-3">
                {
                  actionCounts.size > 0 &&
                  <table className="table table-striped table-sm mt-3"
                         style={{width: '100%'}}>
                    <thead>
                    <tr>
                      <th>Action</th>
                      <th>Count</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Array.from(actionCounts.entries()).map(([table, count]) => (
                      <tr key={table}>
                        <td style={{wordBreak: 'break-word'}}>{table}</td>
                        <td style={{
                          backgroundColor: `rgba(${255 * (1 - (successActionCounts.get(table) || 0) / count)}, ${255 * ((successActionCounts.get(table) || 0) / count)}, 0, 0.3)`
                        }}>{successActionCounts.get(table) || 0}/{count}</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                }
                {
                  count.size > 0 &&
                  <table className="table table-striped table-sm mt-3"
                         style={{width: 'auto', whiteSpace: 'nowrap'}}>
                    <thead>
                    <tr>
                      <th>Table</th>
                      <th>Count</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Array.from(count.entries()).map(([table, count]) => (
                      <tr key={table}>
                        <td>{table}</td>
                        <td>{count}</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                }
              </div>

              <pre style={{maxHeight: '600px', overflow: 'auto'}}>
                <code className="language-sql">
                  {code}
                </code>
              </pre>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Home;