import React from "react";
import "./Navbar.css"
const Navbar = () => {
    return (
        <div>
          <nav className="navbar">
            <a href="#" className="navbar-brand">Acutusai</a>
            <button className="navbar-toggler">&#9776;</button>
            <ul className="navbar-nav">
              <li className="nav-item">
                <a href="#" className="nav-link">Home</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">About</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">Services</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">Contact</a>
                <div className="dropdown-menu">
                  <a href="#">Email</a>
                  <a href="#">Phone</a>
                  <a href="#">Live Chat</a>
                </div>
              </li>
            </ul>
          </nav>
          {/* Rest of the component's content */}
          
        </div>
      );
}

export default Navbar;