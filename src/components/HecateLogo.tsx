import React from 'react';
import { HecateSmoke } from './HecateSmoke';
import './HecateLogo.css';

export const HecateLogo: React.FC = () => {
  return (
    <div className="hecate-logo-wrapper">
      <HecateSmoke />
      <h1 className="hecate-mark">
        <span className="hecate-glow">HECATE</span>
        <span className="hecate-base">HECATE</span>
      </h1>
    </div>
  );
};
