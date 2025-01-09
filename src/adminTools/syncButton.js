import React from 'react';
import { syncWaterCounts } from '../services/firestoreService';

const Dashboard = () => {
  // ... existing code

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
    <Container>
      {/* Existing dashboard UI */}
      <Button onClick={handleSyncWaterCounts} variant="warning">
        Sync Water Counts
      </Button>
    </Container>
  );
};
