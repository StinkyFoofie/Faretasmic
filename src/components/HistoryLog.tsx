import React from 'react';

interface HistoryLogProps {
  logs: string[];
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ logs }) => {
  return (
    <div className="panel details-panel-25">
      <div className="panel-title">Flight Number History Log</div>
      <ul className="history-list" id="ui-history-log" style={{ marginTop: '2px' }}>
        {logs.map((log, idx) => (
          <li key={idx}>{log}</li>
        ))}
      </ul>
    </div>
  );
};
