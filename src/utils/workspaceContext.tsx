import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import fetcher from './fetcher';
import { useAuth } from './authContext';
import { Workspace } from '../types/api';

interface WorkspaceContextType {
  workspaces: Workspace[];
  selectedWorkspaceId: string | null;
  selectedWorkspace: Workspace | null;
  isWorkspaceReady: boolean;
  setSelectedWorkspaceId: (workspaceId: string) => void;
  refreshWorkspaces: () => Promise<void>;
}

const defaultWorkspaceContext: WorkspaceContextType = {
  workspaces: [],
  selectedWorkspaceId: null,
  selectedWorkspace: null,
  isWorkspaceReady: false,
  setSelectedWorkspaceId: () => {},
  refreshWorkspaces: async () => {},
};

const WorkspaceContext = createContext<WorkspaceContextType>(defaultWorkspaceContext);

export const useWorkspace = () => useContext(WorkspaceContext);

const selectedWorkspaceKey = (userId: string | number) => `workspace:selected:${userId}`;

const getUserIdFromToken = (token?: string | null) => {
  if (!token || typeof window === 'undefined') return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    return payload.userID || payload.userId || payload.sub || null;
  } catch {
    return null;
  }
};

const markWorkspaceValidated = (userId: string | number) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('workspace:validated-user-id', String(userId));
  }
};

const clearWorkspaceValidation = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('workspace:validated-user-id');
  }
};

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { auth } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceIdState] = useState<string | null>(null);
  const [isWorkspaceReady, setIsWorkspaceReady] = useState(false);

  const userIdValue = auth.user?.id || auth.user?.userID || getUserIdFromToken(auth.token);
  const userId = userIdValue ? String(userIdValue) : null;

  const applyValidatedWorkspace = useCallback((availableWorkspaces: Workspace[]) => {
    if (!userId || typeof window === 'undefined') return;

    const storedWorkspaceId = localStorage.getItem(selectedWorkspaceKey(userId));
    const selectedWorkspace = availableWorkspaces.find((workspace) => String(workspace.id) === storedWorkspaceId)
      || availableWorkspaces[0]
      || null;

    if (selectedWorkspace) {
      const workspaceId = String(selectedWorkspace.id);
      localStorage.setItem(selectedWorkspaceKey(userId), workspaceId);
      setSelectedWorkspaceIdState(workspaceId);
      markWorkspaceValidated(userId);
    } else {
      localStorage.removeItem(selectedWorkspaceKey(userId));
      setSelectedWorkspaceIdState(null);
      clearWorkspaceValidation();
    }
  }, [userId]);

  const refreshWorkspaces = useCallback(async () => {
    if (!auth.isAuthenticated || !userId) {
      setWorkspaces([]);
      setSelectedWorkspaceIdState(null);
      setIsWorkspaceReady(false);
      clearWorkspaceValidation();
      return;
    }

    setIsWorkspaceReady(false);
    clearWorkspaceValidation();

    const availableWorkspaces = await fetcher('/api/workspaces');
    setWorkspaces(availableWorkspaces || []);
    applyValidatedWorkspace(availableWorkspaces || []);
    setIsWorkspaceReady(true);
  }, [applyValidatedWorkspace, auth.isAuthenticated, userId]);

  useEffect(() => {
    refreshWorkspaces().catch(() => {
      setWorkspaces([]);
      setSelectedWorkspaceIdState(null);
      setIsWorkspaceReady(true);
      clearWorkspaceValidation();
    });
  }, [refreshWorkspaces]);

  const setSelectedWorkspaceId = useCallback((workspaceId: string) => {
    if (!userId) return;

    const workspaceExists = workspaces.some((workspace) => String(workspace.id) === workspaceId);
    if (!workspaceExists) return;

    localStorage.setItem(selectedWorkspaceKey(userId), workspaceId);
    setSelectedWorkspaceIdState(workspaceId);
    markWorkspaceValidated(userId);
  }, [userId, workspaces]);

  const selectedWorkspace = useMemo(
    () => workspaces.find((workspace) => String(workspace.id) === selectedWorkspaceId) || null,
    [selectedWorkspaceId, workspaces]
  );

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        selectedWorkspaceId,
        selectedWorkspace,
        isWorkspaceReady,
        setSelectedWorkspaceId,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
