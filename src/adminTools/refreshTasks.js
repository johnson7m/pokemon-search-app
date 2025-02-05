import React from "react";

const handleTestRefresh = async () => {
    await checkAndRefreshTasks(user.uid);
    alert('Refresh test complete!');
  }

export function RefreshTasks() {
  return <Button onClick={handleTestRefresh}>testbutton</Button>;
}
  