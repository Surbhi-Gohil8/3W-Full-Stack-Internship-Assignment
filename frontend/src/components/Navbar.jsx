import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };

  // Generate initials for avatar (e.g. Uyiosa Ogieobadan -> UO)
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="top-nav-bar d-flex align-items-center justify-content-between px-3 py-2">
      {/* Brand Logo */}
      <h1 className="brand-logo m-0">TaskPlanet </h1>

      {/* Badges and Actions */}
      <div className="d-flex align-items-center gap-3">
   

        {/* User Avatar with Progress Outer Ring */}
        <Dropdown align="end">
          <Dropdown.Toggle as="div" className="avatar-ring-container" id="avatar-dropdown">
            <div className="avatar-progress-ring">
              <div className="avatar-circle">
                {getInitials(user.name)}
              </div>
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu className="dropdown-menu-dark mt-2 border-secondary shadow">
            <Dropdown.Header className="text-light-50 fw-bold border-bottom border-secondary pb-2 mb-2">
              {user.name}
            </Dropdown.Header>
            <Dropdown.Item onClick={handleLogout} className="text-danger d-flex align-items-center gap-2">
              <LogOut size={16} />
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default Navbar;
