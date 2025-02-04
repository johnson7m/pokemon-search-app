// src/components/TasksToggleFixed.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaClipboardList } from 'react-icons/fa';
import './TasksToggleFixed.css';

const TasksToggleFixed = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
    onToggle(!isOpen);
  };

  return (
    <motion.button
      className="tasks-toggle-fixed"
      onClick={handleClick}
      aria-label="Toggle Tasks Overlay"
      aria-pressed={isOpen}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <FaClipboardList />
    </motion.button>
  );
};

export default TasksToggleFixed;
