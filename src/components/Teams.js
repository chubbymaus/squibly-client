import React from 'react';
import styled from "styled-components";
import { Link } from "react-router-dom";

const TeamWrapper = styled.div`
    grid-column: 1;
    grid-row: 1 / 4;
    background-color: #2a3443;
    color: #e6e6e6;
    ul{
        list-style-type: none;

    }
`;

const TeamList = styled.ul`
  width: 100%;
  padding-left: 0px;
  list-style: none;
`;

const TeamListItem = styled.li`
  height: 50px;
  width: 50px;
  background-color: #fafafa;
  color: #2a3443;
  margin: auto;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border-radius: 11px;
  &:hover {
    border-style: solid;
    border-width: thick;
    border-color: #48acf0;
  }
`;

const team = ({ id, letter }) => <Link to={`/view-team/${id}`} key={`team-${id}`}><TeamListItem>{letter}</TeamListItem></Link>;

export default ({ teams }) => (
    <TeamWrapper>
        <TeamList>{teams.map(team)}</TeamList>
    </TeamWrapper>
);