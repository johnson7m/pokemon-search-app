import React from 'react';
import { clearAllTasks } from '../adminTools/adminService';
import { seedSampleTasks } from '../services/firestoreService';
import { Button } from 'react-bootstrap';
import { checkAndRefreshTasks } from '../services/tasksRefreshService';
import { useAuthContext } from '../contexts/AuthContext';
import { syncWaterCounts } from './syncHandlers';

function AdminTools() {
    const { user } = useAuthContext();

    const handleTestRefresh = async () => {
        await checkAndRefreshTasks(user.uid);
        alert('Refresh test complete!');
      }

    const handleClearAndReseed = async () => {
        await clearAllTasks();
        await seedSampleTasks();
        alert('Tasks collection cleared and re-seeded.');
    };

    const handleSyncWaterCounts = async () => {
        try {
          await syncWaterCounts();
          alert('Water type sync completed!');
        } catch (error) {
          console.error('Error syncing water counts:', error);
          alert('Failed to sync water counts.');
        }
      };

    return (
        <>
            <Button onClick={handleClearAndReseed} className='my-2 mx-2'>Clear & Reseed Tasks</Button>
            <Button onClick={handleTestRefresh} className='my-2 mx-2'>Refresh Tasks</Button>
            <Button onClick={handleSyncWaterCounts} className='my-2 mx-2'>Sync Water counts</Button>
        </>
    );
}

export default AdminTools;