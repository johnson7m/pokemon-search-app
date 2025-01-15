// src/contexts/LoadingContext.js
import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react';

// Create LoadingContext
const LoadingContext = createContext();

// Custom hook for using LoadingContext
export const useLoadingContext = () => useContext(LoadingContext);

// Initial state
const initialState = {
  sections: {},      // { sectionId: boolean }
  groups: {},        // { groupId: [sectionId] }
  groupStatus: {},   // { groupId: 'done' | 'pending' }
};

// Reducer function
function loadingReducer(state, action) {
  switch (action.type) {
    case 'START_LOADING':
      console.log(`Reducer: START_LOADING - Section: ${action.payload.section}`);
      return {
        ...state,
        sections: { ...state.sections, [action.payload.section]: true },
      };
      
    case 'STOP_LOADING':
      console.log(`Reducer: STOP_LOADING - Section: ${action.payload.section}`);
      return {
        ...state,
        sections: { ...state.sections, [action.payload.section]: false },
      };
      
    case 'REGISTER_GROUP':
      const { group, section } = action.payload;
      console.log(`Reducer: REGISTER_GROUP - Group: ${group}, Section: ${section}`);
      const existingSections = state.groups[group] || [];
      if (!existingSections.includes(section)) {
        return {
          ...state,
          groups: {
            ...state.groups,
            [group]: [...existingSections, section],
          },
        };
      }
      return state; // No changes if section already exists in group
      
    case 'CHECK_GROUP_COMPLETION':
      const groupToCheck = action.payload;
      console.log(`Reducer: CHECK_GROUP_COMPLETION - Group: ${groupToCheck}`);
      const allDone = (state.groups[groupToCheck] || []).every(
        (sec) => !state.sections[sec]
      );
      console.log(`Reducer: CHECK_GROUP_COMPLETION - All done: ${allDone}`);
      return {
        ...state,
        groupStatus: { ...state.groupStatus, [groupToCheck]: allDone ? 'done' : 'pending' },
      };
      
    case 'REMOVE_GROUP':
      const { [action.payload]: removedGroup, ...remainingGroups } = state.groups;
      const { [action.payload]: removedStatus, ...remainingGroupStatus } = state.groupStatus;
      console.log(`Reducer: REMOVE_GROUP - Group: ${action.payload}`);
      return {
        ...state,
        groups: remainingGroups,
        groupStatus: remainingGroupStatus,
      };
      
    default:
      console.error(`Reducer: Unhandled action type: ${action.type}`);
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

// Provider component
export const LoadingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(loadingReducer, initialState);

  // Start loading
  const startLoading = useCallback((section, group = null) => {
    console.log(`Context: startLoading - Section: ${section}, Group: ${group}`);
    dispatch({ type: 'START_LOADING', payload: { section } });
    if (group) {
      dispatch({ type: 'REGISTER_GROUP', payload: { group, section } });
    }
  }, []);

  // Stop loading
  const stopLoading = useCallback((section, group = null) => {
    console.log(`Context: stopLoading - Section: ${section}, Group: ${group}`);
    dispatch({ type: 'STOP_LOADING', payload: { section } });
    if (group) {
      dispatch({ type: 'CHECK_GROUP_COMPLETION', payload: group });
    }
  }, []);

  // Effect to remove groups that are done
  useEffect(() => {
    Object.entries(state.groupStatus).forEach(([group, status]) => {
      if (status === 'done') {
        console.log(`Effect: Removing done group - Group: ${group}`);
        dispatch({ type: 'REMOVE_GROUP', payload: group });
      }
    });
  }, [state.groupStatus]);

  // Determine if any loading is active globally
  const isLoadingGlobally = useMemo(() => {
    const globalLoading = Object.values(state.sections).some((status) => status);
    console.log(`Context: isLoadingGlobally - ${globalLoading}`);
    return globalLoading;
  }, [state.sections]);

  // Memoize context value
  const value = useMemo(
    () => ({
      sections: state.sections,
      groups: state.groups,
      loadingStates: state,
      isLoadingGlobally,
      startLoading,
      stopLoading,
    }),
    [state, isLoadingGlobally, startLoading, stopLoading]
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};
