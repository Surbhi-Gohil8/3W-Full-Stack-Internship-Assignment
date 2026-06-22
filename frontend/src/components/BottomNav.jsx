import React from 'react';
import { Home, ClipboardList, Globe, Trophy, MessageCircle } from 'lucide-react';

const BottomNav = () => {
  return (
    <div className="bottom-nav-bar d-flex align-items-center justify-content-around py-2 border-top">
      {/* Home Tab */}
      <div className="bottom-nav-item d-flex flex-column align-items-center text-white-50">
        <Home size={20} />
        <span className="nav-label mt-1">Home</span>
      </div>

      {/* Tasks Tab */}
      <div className="bottom-nav-item d-flex flex-column align-items-center text-white-50">
        <ClipboardList size={20} />
        <span className="nav-label mt-1">Tasks</span>
      </div>

      {/* Social Tab (Active) */}
      <div className="bottom-nav-item d-flex flex-column align-items-center active-nav-item">
        <div className="active-pill d-flex flex-column align-items-center justify-content-center">
          <Globe size={20} className="active-icon" />
          <span className="active-nav-label mt-1">Social</span>
        </div>
      </div>

      {/* Leader Board Tab */}
      <div className="bottom-nav-item d-flex flex-column align-items-center text-white-50">
        <div className="position-relative">
          <Trophy size={20} />
        </div>
        <span className="nav-label mt-1">Leader Board</span>
      </div>

      {/* Chat Tab */}
      <div className="bottom-nav-item d-flex flex-column align-items-center text-white-50">
        <MessageCircle size={20} />
        <span className="nav-label mt-1">Chat</span>
      </div>
    </div>
  );
};

export default BottomNav;
