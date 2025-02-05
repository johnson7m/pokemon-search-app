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

  /** Separate tasks into "unaccepted" and "active" for a given type */
  const getTaskGroups = (tasks, typeLabel) => {
    const unaccepted = tasks.filter(
      (t) => !acceptedTasks.some((accepted) => accepted.taskId === t.id)
    );
    const active = acceptedTasks.filter(
      (a) => a.taskType === typeLabel && !a.isCompleted
    );
    return { unaccepted, active };
  };

  /** Renders the tasks for one category (Daily/Weekly/Monthly) */
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
        <Card className="h-100">
          <Card.Header>
            <h4 className="mb-0">{label} Tasks</h4>
          </Card.Header>

          <Card.Body className="d-flex flex-column justify-content-between">
            <div>
              <h6>New</h6>
              {/* 
                For a horizontal/row approach, we can do a row with flex-nowrap 
                so you can scroll horizontally for multiple tasks 
              */}
              <Row style={{ gap: '1rem'}}>
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
                        <Button variant="primary" onClick={() => acceptTask(task)}>
                          Accept
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            <hr />

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
                    <ProgressBar
                      now={acceptedTask.currentProgress}
                      max={acceptedTask.progressGoal}
                      label={`${acceptedTask.currentProgress}/${acceptedTask.progressGoal}`}
                      className="mb-2"
                    />
                    <Button
                      variant="success"
                      onClick={() => completeTask(acceptedTask, xpTrigger)}
                    >
                      Complete
                    </Button>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  /** MAIN RENDER **/
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
              <Button variant="close" onClick={onClose}>
              </Button>
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
            // Desktop layout: 3 columns side by side
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
