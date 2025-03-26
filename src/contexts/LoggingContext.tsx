import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

// Define log categories
export type LogCategory = 'App' | 'Graph' | 'Svg' | 'Form' | 'System';

// Define log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Define log group options
export type LogGroupOptions = {
  collapsed?: boolean;
  title?: string;
  end?: boolean;
};

// Configuration for logging
export interface LoggingConfig {
  enabled: boolean;
  categories: {
    [key in LogCategory]: boolean;
  };
  levels: {
    [key in LogLevel]: boolean;
  };
  useGroups: boolean;
  defaultCollapsed: boolean;
}

// Interface for the context
interface LoggingContextType {
  config: LoggingConfig;
  setConfig: React.Dispatch<React.SetStateAction<LoggingConfig>>;
  log: (category: LogCategory, level: LogLevel, message: string, data?: any) => void;
  logGroup: (category: LogCategory, level: LogLevel, options?: LogGroupOptions) => void;
  toggleLogging: () => void;
  toggleCategory: (category: LogCategory) => void;
  toggleLevel: (level: LogLevel) => void;
  toggleUseGroups: () => void;
  toggleDefaultCollapsed: () => void;
}

// Default configuration
const defaultConfig: LoggingConfig = {
  enabled: true,
  categories: {
    App: true,
    Graph: true,
    Svg: true,
    Form: true,
    System: true
  },
  levels: {
    debug: true,
    info: true,
    warn: true,
    error: true
  },
  useGroups: true,
  defaultCollapsed: true
};

// Create the context
const LoggingContext = createContext<LoggingContextType | undefined>(undefined);

// Color mapping for categories
const categoryColors: Record<LogCategory, string> = {
  App: '#4CAF50',     // Green
  Graph: '#2196F3',   // Blue
  Svg: '#9C27B0',     // Purple
  Form: '#FF9800',    // Orange
  System: '#607D8B'   // Blue Grey
};

// Color mapping for levels
const levelColors: Record<LogLevel, string> = {
  debug: '#90A4AE',   // Light Blue Grey
  info: '#64B5F6',    // Light Blue
  warn: '#FFD54F',    // Light Amber
  error: '#EF5350'    // Light Red
};

// Create a provider component
export const LoggingProvider: React.FC<{
  children: ReactNode,
  initialConfig?: Partial<LoggingConfig>
}> = ({ children, initialConfig }) => {
  const [config, setConfig] = useState<LoggingConfig>({
    ...defaultConfig,
    ...initialConfig
  });

  // Keep track of active groups to properly close them
  const activeGroups = useRef<string[]>([]);

  // Helper to format log header
  const formatLogHeader = (category: LogCategory, level: LogLevel, message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
    return {
      text: `[${timestamp}] [${category}] [${level}] ${message}`,
      style: [
        'color: gray;',
        `color: ${categoryColors[category]}; font-weight: bold;`,
        `color: ${levelColors[level]}; font-weight: bold;`,
        level === 'error' ? 'color: #EF5350;' : ''
      ]
    };
  };

  // Logging function
  const log = (category: LogCategory, level: LogLevel, message: string, data?: any) => {
    if (!config.enabled || !config.categories[category] || !config.levels[level]) {
      return;
    }

    const { text, style } = formatLogHeader(category, level, message);

    if (data !== undefined) {
      if (config.useGroups) {
        console.groupCollapsed(`%c${text}`, ...style);
        if (typeof data === 'object' && data !== null) {
          Object.entries(data).forEach(([key, value]) => {
            console.log(`%c${key}:`, 'font-weight: bold;', value);
          });
        } else {
          console.log(data);
        }
        console.groupEnd();
      } else {
        console.log(`%c${text}`, ...style, data);
      }
    } else {
      console.log(`%c${text}`, ...style);
    }
  };

  // Group logging function
  const logGroup = (category: LogCategory, level: LogLevel, options: LogGroupOptions = {}) => {
    if (!config.enabled || !config.categories[category] || !config.levels[level] || !config.useGroups) {
      return;
    }

    const { collapsed = config.defaultCollapsed, title = '', end = false } = options;

    if (end) {
      if (activeGroups.current.length > 0) {
        activeGroups.current.pop();
        console.groupEnd();
      }
      return;
    }

    const { text, style } = formatLogHeader(category, level, title);
    const groupId = `${category}-${level}-${Date.now()}`;

    if (collapsed) {
      console.groupCollapsed(`%c${text}`, ...style);
    } else {
      console.group(`%c${text}`, ...style);
    }

    activeGroups.current.push(groupId);
  };

  // Close all active groups when component unmounts
  React.useEffect(() => {
    return () => {
      activeGroups.current.forEach(() => console.groupEnd());
      activeGroups.current = [];
    };
  }, []);

  // Toggle entire logging system
  const toggleLogging = () => {
    setConfig(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  // Toggle specific category
  const toggleCategory = (category: LogCategory) => {
    setConfig(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category]
      }
    }));
  };

  // Toggle specific level
  const toggleLevel = (level: LogLevel) => {
    setConfig(prev => ({
      ...prev,
      levels: {
        ...prev.levels,
        [level]: !prev.levels[level]
      }
    }));
  };

  // Toggle use of console groups
  const toggleUseGroups = () => {
    setConfig(prev => ({
      ...prev,
      useGroups: !prev.useGroups
    }));
  };

  // Toggle default collapsed state
  const toggleDefaultCollapsed = () => {
    setConfig(prev => ({
      ...prev,
      defaultCollapsed: !prev.defaultCollapsed
    }));
  };

  return (
    <LoggingContext.Provider value={{
      config,
      setConfig,
      log,
      logGroup,
      toggleLogging,
      toggleCategory,
      toggleLevel,
      toggleUseGroups,
      toggleDefaultCollapsed
    }}>
      {children}
    </LoggingContext.Provider>
  );
};

// Custom hook to use the logging context
export const useLogging = () => {
  const context = useContext(LoggingContext);
  if (context === undefined) {
    throw new Error('useLogging must be used within a LoggingProvider');
  }
  return context;
};

// Helper hook for component logging
export const useComponentLogger = (category: LogCategory) => {
  const { log, logGroup, config } = useLogging();
  const activeOperations = useRef<Map<string, boolean>>(new Map());

  const startOperation = (operation: string, level: LogLevel = 'debug') => {
    if (activeOperations.current.has(operation)) {
      return false; // Operation already started
    }

    logGroup(category, level, {
      title: `Starting ${operation}`,
      collapsed: config.defaultCollapsed
    });

    activeOperations.current.set(operation, true);
    return true;
  };

  const endOperation = (operation: string, level: LogLevel = 'debug', result?: any) => {
    if (!activeOperations.current.has(operation)) {
      return false; // Operation not started
    }

    if (result !== undefined) {
      log(category, level, `Result of ${operation}:`, result);
    }

    logGroup(category, level, { end: true });
    activeOperations.current.delete(operation);
    return true;
  };

  return {
    // Basic logging methods
    debug: (message: string, data?: any) => log(category, 'debug', message, data),
    info: (message: string, data?: any) => log(category, 'info', message, data),
    warn: (message: string, data?: any) => log(category, 'warn', message, data),
    error: (message: string, data?: any) => log(category, 'error', message, data),

    // Group methods
    group: (title: string, collapsed?: boolean) => {
      logGroup(category, 'info', { title, collapsed });
    },
    groupDebug: (title: string, collapsed?: boolean) => {
      logGroup(category, 'debug', { title, collapsed });
    },
    groupWarn: (title: string, collapsed?: boolean) => {
      logGroup(category, 'warn', { title, collapsed });
    },
    groupError: (title: string, collapsed?: boolean) => {
      logGroup(category, 'error', { title, collapsed });
    },
    groupEnd: () => {
      logGroup(category, 'debug', { end: true });
    },

    // Operations tracking (start/end pairs with automatic grouping)
    startOperation,
    endOperation,

    // Trace an async operation with automatic start/end
    traceAsync: async function<T>(
      operation: string,
      fn: () => Promise<T>,
      level: LogLevel = 'debug'
    ): Promise<T> {
      startOperation(operation, level);
      try {
        const result = await fn();
        log(category, level, `${operation} completed successfully`);
        endOperation(operation, level, result);
        return result;
      } catch (error) {
        log(category, 'error', `${operation} failed:`, error);
        endOperation(operation, 'error');
        throw error;
      }
    },

    // Trace a sync operation with automatic start/end
    trace: function<T>(
      operation: string,
      fn: () => T,
      level: LogLevel = 'debug'
    ): T {
      startOperation(operation, level);
      try {
        const result = fn();
        endOperation(operation, level, result);
        return result;
      } catch (error) {
        log(category, 'error', `${operation} failed:`, error);
        endOperation(operation, 'error');
        throw error;
      }
    }
  };
};

// Create a simple hash function for comparing strings
export const hashString = (str: string): string => {
  if (!str) return '0';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16); // Convert to hex
};

// Helper function to truncate long strings
export const truncate = (str: string, maxLength = 20): string => {
  if (!str) return '';
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
};
