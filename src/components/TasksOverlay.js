// src/components/TasksOverlay.js
import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import { Card, Button, Row, Col, Tab, Nav } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useTasksContext } from '../contexts/TasksContext';
import useMediaQuery from '../hooks/useMediaQuery';
import { ThemeContext } from '../contexts/ThemeContext';
import './TasksOverlay.css'

const TasksOverlay = ({ show, onClose }) => {
  const {
    dailyTasks,
    weeklyTasks,
    monthlyTasks,
    acceptedTasks,
    acceptTask,
  } = useTasksContext();
  const isMobile = useMediaQuery('(max-width: 768px)'); // returns true if <= 768px
  const [activeKey, setActiveKey] = useState('daily');
  const { theme } = useContext(ThemeContext);


  if (!show) return null;

  // Helper to get 'unaccepted' vs 'active'
  const getTaskGroups = (tasks, typeLabel) => {
    const unaccepted = tasks.filter(
      (t) => !acceptedTasks.some((accepted) => accepted.taskId === t.id)
    );
    const active = acceptedTasks.filter((a) => a.taskType === typeLabel);
    return { unaccepted, active };
  };

  const renderTaskSection = (label, tasks, typeLabel) => {
    const { unaccepted, active } = getTaskGroups(tasks, typeLabel);

    return (
      <Col data-bs-theme={theme === 'light' ? 'light' : 'dark'} xs={12} md={4} className="mb-3" key={typeLabel}>
        <Card style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <Card.Header>
            <h4 style={{ margin: 0 }}>{label} Tasks</h4>
          </Card.Header>

          <Card.Body className="d-flex flex-column">
            {/* New Tasks */}
            <div>
              <h6>New</h6>
              {unaccepted.length === 0 && <p>No new tasks</p>}
              {unaccepted.map((task) => (
                <Card key={task.id} className="mb-2">
                  <Card.Body>
                    <Card.Title>{task.title}</Card.Title>
                    <Card.Text>{task.description}</Card.Text>
                    <Button variant="primary" onClick={() => acceptTask(task)}>
                      Accept
                    </Button>
                  </Card.Body>
                </Card>
              ))}
            </div>

            <hr />

            {/* Active Tasks */}
            <div>
              <h6>Active</h6>
              {active.length === 0 && <p>No active tasks</p>}
              {active.map((acceptedTask) => (
                <Card key={acceptedTask.id} className="mb-2">
                  <Card.Body>
                    <Card.Title>{acceptedTask.title}</Card.Title>
                    <Card.Text>{acceptedTask.description}</Card.Text>
                    {/* 
                      <Button variant="success" onClick={() => completeTask(acceptedTask)}>
                        Complete
                      </Button>
                    */}
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
        className={`tasks-overlay-container bg-${theme === 'light' ? 'light' : 'dark'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Button
          variant={theme === 'dark' ? 'danger' : 'danger'}
          className="tasks-overlay-close mb-2"
          onClick={onClose}
        >
          X
        </Button>
        {isMobile ? (
          // Mobile layout: TABS
          <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
            <Nav variant="tabs" className={`mb-3 ${theme === 'dark' ? 'nav-dark' : 'nav-light'}`}>
              <Nav.Item>
                <Nav.Link eventKey="daily" className={theme === 'dark' ? 'text-light' : 'text-dark'}>Daily</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="weekly" className={theme === 'dark' ? 'text-light' : 'text-dark'}>Weekly</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="monthly" className={theme === 'dark' ? 'text-light' : 'text-dark'}>Monthly</Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content>
              <Tab.Pane eventKey="daily">
                {renderTaskSection('Daily', dailyTasks, 'daily')}
              </Tab.Pane>
              <Tab.Pane eventKey="weekly">
                {renderTaskSection('Weekly', weeklyTasks, 'weekly')}
              </Tab.Pane>
              <Tab.Pane eventKey="monthly">
                {renderTaskSection('Monthly', monthlyTasks, 'monthly')}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        ) : (
          // Desktop layout: 3 columns
          <Row>
            {renderTaskSection('Daily', dailyTasks, 'daily')}
            {renderTaskSection('Weekly', weeklyTasks, 'weekly')}
            {renderTaskSection('Monthly', monthlyTasks, 'monthly')}
          </Row>
        )}
      </motion.div>
    </div>,
    document.body
  );
};

export default TasksOverlay;
