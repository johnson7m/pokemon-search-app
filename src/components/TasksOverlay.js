// src/components/TasksOverlay.js
import React from 'react';
import { Modal, Card, Button, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useTasksContext } from '../contexts/TasksContext';

const TasksOverlay = ({ show, onClose }) => {
  const {
    dailyTasks,
    weeklyTasks,
    monthlyTasks,
    acceptedTasks, // renamed this
    acceptTask,
  } = useTasksContext();

  if (!show) return null;

  const renderTaskColumn = (tasks, typeLabel) => {
    // Separate unaccepted vs. active

    // "unaccepted" tasks => tasks in the global array that are not yet accepted
    const unaccepted = tasks.filter(
      (t) => !acceptedTasks.some((accepted) => accepted.taskId === t.id)
    );

    // "active" tasks => the user has accepted them and they match typeLabel
    const active = acceptedTasks.filter(
      (a) => a.taskType === typeLabel
    );

    return (
      <Col xs={12} md={4}>
        <h4>{typeLabel} Tasks</h4>
        
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

        <div>
          <h6>Active</h6>
          {active.length === 0 && <p>No active tasks</p>}
          {active.map((acceptedTask) => (
            <Card key={acceptedTask.id} className="mb-2">
              <Card.Body>
                <Card.Title>{acceptedTask.title}</Card.Title>
                <Card.Text>{acceptedTask.description}</Card.Text>
                {/* For advanced logic (like marking complete) 
                    <Button variant="success" onClick={() => completeTask(acceptedTask)}>
                      Complete
                    </Button> 
                */}
              </Card.Body>
            </Card>
          ))}
        </div>
      </Col>
    );
  };

  return (
    <div className="tasks-overlay-backdrop">
      <motion.div
        className="tasks-overlay-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Button
          variant="outline-light"
          className="tasks-overlay-close"
          onClick={onClose}
        >
          X
        </Button>

        <Row>
          {renderTaskColumn(dailyTasks, 'daily')}
          {renderTaskColumn(weeklyTasks, 'weekly')}
          {renderTaskColumn(monthlyTasks, 'monthly')}
        </Row>
      </motion.div>
    </div>
  );
};

export default TasksOverlay;
