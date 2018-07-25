import React from 'react';
import styled from "styled-components";
import { Icon } from "semantic-ui-react"
import { Link } from "react-router-dom";

const ChannelWrapper = styled.div`
    grid-column: 2;
    grid-row: 1 / 4;
    background-color: #384455;
    color: #fff;

`;

const TeamNameHeader = styled.h1`
  color: #fff;
  font-size: 20px;
`;

const SideBarList = styled.ul`
  width: 100%;
  list-style: none;
  padding-left: 0px;
`;

const paddingLeft = 'padding-left: 10px';

const SideBarListItem = styled.li`
  padding: 2px;
  ${paddingLeft};
  &:hover {
    background: #48acf0;
  }
`;

const SideBarListHeader = styled.li`${paddingLeft};`;

const PushLeft = styled.div`${paddingLeft};`;

const Green = styled.span`color: #31C56E;`;

const Bubble = ({ on = true }) => (on ? <Green>●</Green> : '○');

const channel = ({ id, name }, teamId) => (
    <Link key={`channel-${id}`} to={`/view-team/${teamId}/${id}`}>
        <SideBarListItem>
            # {name}
        </SideBarListItem>
    </Link>
);

const user = ({ id, name }) => (

    <SideBarListItem key={`user-${id}`}>
        <Bubble /> {name}
    </SideBarListItem>

);

export default ({ teamName, username, channels, users, onAddChannelClick, teamId, }) => (
    <ChannelWrapper>
        <PushLeft>
            <TeamNameHeader>{teamName}</TeamNameHeader>
            {username}
        </PushLeft>
        <div>
            <SideBarList>
                <SideBarListHeader>Channels <Icon onClick={onAddChannelClick} name="add circle" /></SideBarListHeader>
                {channels.map((c) => channel(c, teamId))}
            </SideBarList>
        </div>
        <div>
            <SideBarList>
                <SideBarListHeader>Direct Messages</SideBarListHeader>
                {users.map(user)}
            </SideBarList>
        </div>
    </ChannelWrapper>
);