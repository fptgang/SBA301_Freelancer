import React, {useEffect, useState} from 'react';
import {Col, Container, Row, Spinner} from 'react-bootstrap';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-sql';
import {ConfigForm} from './ConfigForm';
import {SqlFileAppender} from "../engine/appender.js";
import {DumpCategories, ResetCategories} from "../engine/seed/CategoryDump.js";
import {DumpSkills, ResetSkills} from "../engine/seed/SkillDump.js";
import {DumpAccounts, ResetAccountPool} from "../engine/sim/account.js";
import {Simulate} from "../engine/sim/index.js";
import {
  DumpActiveProposalId,
  DumpProjects,
  ResetProjectPool
} from "../engine/sim/project.js";
import {DumpProposals, ResetProposalPool} from "../engine/sim/proposal.js";
import {
  DumpTransactions,
  ResetTransactionPool
} from "../engine/sim/transaction.js";
import toast from 'react-hot-toast';
import {DumpProfiles, ResetProfilePool} from '../engine/sim/profile.js';

const Home: React.FC = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generateTime, setGenerateTime] = useState<number | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {

    SqlFileAppender.setInMemoryMode(true);

  }, []);

  useEffect(() => {
    if (code && !isLoading) {
      setTimeout(() => {
        Prism.highlightAll();
      }, 0);
    }
  }, [code, isLoading]);

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
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  const startTime = performance.now();

                  ResetCategories();
                  ResetSkills();
                  ResetAccountPool();
                  ResetProfilePool();
                  ResetTransactionPool();
                  ResetProjectPool();
                  ResetProposalPool();

                  SqlFileAppender.prepare();
                  DumpCategories();
                  DumpSkills();
                  Simulate(function (progress: number) {
                    setProgress(progress);
                  });
                  DumpAccounts();
                  DumpProfiles();
                  DumpTransactions();
                  DumpProjects(); // including milestones and project_skills
                  DumpProposals();
                  DumpActiveProposalId();

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
            <pre style={{maxHeight: '600px', overflow: 'auto'}}>
              <code className="language-sql">
                {code}
              </code>
            </pre>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Home;