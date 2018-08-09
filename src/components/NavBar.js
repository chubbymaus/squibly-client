import React from 'react';
import {
  Link
} from "react-router-dom";
import logo from '../img/chatNav.png';
import styled from "styled-components";

const Nav = styled.nav`
  height: 60px;
  padding: 0 10px;
  background-color: #2a3443;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const NavLogo = styled.img`
  margin:0;
  padding: 0;
  max-height: 45px;
`

const NavMenu = styled.div`
  display: flex;
`
const NavItem = styled.div`
  padding: 0 5px;
  color: #fff;
`

 const NavBar = () => (
  <Nav>
    <NavLogo src={logo} alt="squibly logo"/>
    <NavMenu> 
      <Link to="/view-team">
        <NavItem>View Team</NavItem>
      </Link>
      <Link to="/create-team">
        <NavItem>Create Team</NavItem>
      </Link>
      <Link to="/register">
        <NavItem>Register</NavItem>
      </Link>
    </NavMenu>
  </Nav>
);

export default NavBar;