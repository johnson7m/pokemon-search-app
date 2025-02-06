// src/components/TasksOverlay.js
import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import {
  Card,
  Button,
  Row,
  Col,
  Tab,
  Nav,
  ProgressBar,
  Container
} from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useTasksContext } from '../contexts/TasksContext';
import useMediaQuery from '../hooks/useMediaQuery';
import { ThemeContext } from '../contexts/ThemeContext';
import { useXpContext } from '../contexts/XpContext';

import './TasksOverlay.css';

const TasksOverlay = ({ show, onClose }) => {
  const {
    dailyTasks,
    weeklyTasks,
    monthlyTasks,
    acceptedTasks,
    completeTask,
    acceptTask,
  } = useTasksContext();
  const { xpTrigger } = useXpContext();
  const { theme } = useContext(ThemeContext);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeKey, setActiveKey] = useState('daily');

  if (!show) return null;

  const getTaskGroups = (tasks, typeLabel) => {
    const unaccepted = tasks.filter(
      (t) => !acceptedTasks.some((accepted) => accepted.taskId === t.id)
    );
    const active = acceptedTasks.filter(
      (a) => a.taskType === typeLabel && !a.isCompleted
    );
    return { unaccepted, active };
  };

  /**
   * Renders "New" tasks + "Active" tasks in one column
   */
  const renderTaskSection = (label, tasks, typeLabel) => {
    const { unaccepted, active } = getTaskGroups(tasks, typeLabel);

    return (
      <Col
        data-bs-theme={theme === 'light' ? 'light' : 'dark'}
        xs={12}
        md={4}
        className="mb-3"
        key={typeLabel}
      >
        <Card className="h-100 shadow-lg">
          <Card.Header>
            <h4 className="mb-0">{label} Tasks</h4>
          </Card.Header>

          <Card.Body className="d-flex flex-column justify-content-between">
            {/* NEW */}
            <div>
              <h6>New</h6>
              <Row style={{ gap: '1rem' }}>
                {unaccepted.length === 0 && <p className="ms-3">No new tasks</p>}
                {unaccepted.map((task) => (
                  <Col key={task.id} xs="12" md="auto">
                    <Card className="mb-2">
                      <Card.Body>
                        <Card.Title>{task.title}</Card.Title>
                        <Card.Text>{task.description}</Card.Text>
                        {task.xpReward && (
                          <Card.Text>
                            <small className="text-muted">
                              XP Reward: {task.xpReward}
                            </small>
                          </Card.Text>
                        )}
                        <Button
                          variant="primary"
                          onClick={() => acceptTask(task)}
                        >
                          Accept
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            <hr />

            {/* ACTIVE */}
            <div>
              <h6>Active</h6>
              {active.length === 0 && <p>No active tasks</p>}
              {active.map((acceptedTask) => (
                <Card key={acceptedTask.id} className="mb-2">
                  <Card.Body>
                    <Card.Title>{acceptedTask.title}</Card.Title>
                    <Card.Text>{acceptedTask.description}</Card.Text>
                    {acceptedTask.xpReward && (
                      <Card.Text>
                        <small className="text-muted">
                          XP Reward: {acceptedTask.xpReward}
                        </small>
                      </Card.Text>
                    )}

                    {/* If we have multi-subgoal progressModules */}
                    {acceptedTask.progressModules ? (
                      <>
                        {Object.entries(acceptedTask.progressModules).map(
                          ([modKey, modVal]) => {
                            const nowVal = modVal.currentProgress || 0;
                            const maxVal = modVal.progressGoal || 1;
                            const isModDone = modVal.isCompleted;
                            const percent = Math.floor((nowVal / maxVal) * 100);

                            return (
                              <div
                                key={modKey}
                                style={{
                                  position: 'relative',
                                  marginBottom: '0.5rem'
                                }}
                              >
                                <ProgressBar
                                  now={percent}
                                  variant={isModDone ? 'secondary' : 'info'}
                                  style={{ height: '1rem', borderRadius: '0.5rem' }}
                                />
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none',
                                    color:
                                      theme === 'light'
                                        ? isModDone
                                          ? 'white'
                                          : 'black'
                                        : 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {`${modKey}: ${nowVal}/${maxVal}`}
                                </div>
                              </div>
                            );
                          }
                        )}
                        {/* 
                          Show "Complete" only if 
                          every sub-goal is isCompleted === true
                        */}
                        {Object.values(acceptedTask.progressModules).every(
                          (m) => m.isCompleted
                        ) && (
                          <Button
                            variant="success"
                            onClick={() => completeTask(acceptedTask, xpTrigger)}
                          >
                            Complete
                          </Button>
                        )}
                      </>
                    ) : (
                      // single sub-goal fallback
                      <>
                        <div style={{ position: 'relative', marginRight: '0.5rem' }}>
                          <ProgressBar
                            now={acceptedTask.currentProgress}
                            max={acceptedTask.progressGoal}
                            variant={
                              acceptedTask.currentProgress >= acceptedTask.progressGoal
                                ? 'secondary'
                                : 'info'
                            }
                            style={{ height: '1rem', borderRadius: '0.5rem' }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              pointerEvents: 'none',
                              color:
                                theme === 'light'
                                  ? acceptedTask.currentProgress >= acceptedTask.progressGoal
                                    ? 'white'
                                    : 'black'
                                  : 'white',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {`${acceptedTask.currentProgress}/${acceptedTask.progressGoal}`}
                          </div>
                        </div>

                        {/* 
                          If single sub-goal is done => show Complete button
                        */}
                        {acceptedTask.currentProgress >= acceptedTask.progressGoal && (
                          <Button
                            variant="success"
                            onClick={() => completeTask(acceptedTask, xpTrigger)}
                          >
                            Complete
                          </Button>
                        )}
                      </>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  return ReactDOM.createPortal(
    <div className="tasks-overlay-backdrop">
      <motion.div
        className={`tasks-overlay-container bg-${
          theme === 'light' ? 'light' : 'dark'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Container fluid>
          {/* Close button row */}
          <Row className="justify-content-end mb-2">
            <Col xs="auto">
              <Button variant="close" onClick={onClose}></Button>
            </Col>
          </Row>

          {isMobile ? (
            <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
              <Nav
                variant="tabs"
                className={`mb-3 ${theme === 'dark' ? 'nav-dark' : 'nav-light'}`}
              >
                <Nav.Item>
                  <Nav.Link eventKey="daily" className={theme === 'dark' ? 'text-light' : 'text-dark'}>
                    Daily
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="weekly" className={theme === 'dark' ? 'text-light' : 'text-dark'}>
                    Weekly
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="monthly" className={theme === 'dark' ? 'text-light' : 'text-dark'}>
                    Monthly
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content>
                <Tab.Pane eventKey="daily">
                  <Row>
                    {renderTaskSection('Daily', dailyTasks, 'daily')}
                  </Row>
                </Tab.Pane>
                <Tab.Pane eventKey="weekly">
                  <Row>
                    {renderTaskSection('Weekly', weeklyTasks, 'weekly')}
                  </Row>
                </Tab.Pane>
                <Tab.Pane eventKey="monthly">
                  <Row>
                    {renderTaskSection('Monthly', monthlyTasks, 'monthly')}
                  </Row>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          ) : (
            <Row>
              {renderTaskSection('Daily', dailyTasks, 'daily')}
              {renderTaskSection('Weekly', weeklyTasks, 'weekly')}
              {renderTaskSection('Monthly', monthlyTasks, 'monthly')}
            </Row>
          )}
        </Container>
      </motion.div>
    </div>,
    document.body
  );
};

export default TasksOverlay;
