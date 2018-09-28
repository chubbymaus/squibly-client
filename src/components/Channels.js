import React from 'react';
import styled from "styled-components";
import { Icon } from "semantic-ui-react"
import { Link } from "react-router-dom";

const ChannelWrapper = styled.div`
    grid-column: 2;
    grid-row: 1 / 4;
    background-color: #f6f6f6;
    color: #384455;
    padding-top: 15px;

`;

const TeamNameHeader = styled.h1`
  color: #2a3443;
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
  color: #384455;
  &:hover {
  cursor: pointer;
    background: #48acf0;
    color: #fff;
  }
`;

const SideBarListHeader = styled.li` 
${paddingLeft};
i:hover{
    cursor: pointer;
}
`;

const PushLeft = styled.div`${paddingLeft};`;

const Green = styled.span`color: #31C56E;`;

const AddUserIcon = styled.span`
    color: #31C56E;
`;
const Bubble = ({ on = true }) => (on ? <Green>●</Green> : '○');

const channel = ({ id, name }, teamId) => (
    <Link key={`channel-${id}`} to={`/view-team/${teamId}/${id}`}>
        <SideBarListItem>
            # {name}
        </SideBarListItem>
    </Link>
);

const dmChannel = ({ id, name }, teamId) => (
    <Link key={`user-${id}`} to={`/view-team/${teamId}/${id}`}>
        <SideBarListItem >
            <Bubble /> {name}
        </SideBarListItem>
    </Link>
);

export default ({
    teamName,
    username,
    channels,
    dmChannels,
    onAddChannelClick,
    teamId,
    onInvitePeopleClick,
    onDirectMessageClick,
    isOwner,
}) => (
        <ChannelWrapper>
            <PushLeft>
                <TeamNameHeader>
                    {teamName}
                    {isOwner && (<span>
                        <a href="#invite-people" onClick={onInvitePeopleClick}>
                            <AddUserIcon> <Icon name="user plus" /></AddUserIcon>
                        </a>
                    </span>
                    )}
                </TeamNameHeader>
                {username}

            </PushLeft>
            <div>
                <SideBarList>
                    <SideBarListHeader>
                        Channels {isOwner && (<Icon onClick={onAddChannelClick} name="add circle" />)}
                    </SideBarListHeader>
                    {channels.map((c) => channel(c, teamId))}
                </SideBarList>
            </div>
            <div>
                <SideBarList>
                    <SideBarListHeader>
                        Direct Messages <Icon onClick={onDirectMessageClick} name="add circle" />
                    </SideBarListHeader>
                    {dmChannels.map(dmC => dmChannel(dmC, teamId))}
                </SideBarList>
            </div>
            <div>
                <SideBarList>
                    <SideBarListHeader>
                        <Link to="/view-docs">
                         <h4><Icon name="file alternate outline" />Team Documents</h4>
                        </Link>
                        
                    </SideBarListHeader>
                </SideBarList>
            </div>
            <div>
                <SideBarList>
                    <SideBarListHeader>
                        <Link to="/admin-console">
                         <h4><Icon name="shield alternate" />Squibly Explorer</h4>
                        </Link>
                        
                    </SideBarListHeader>
                </SideBarList>
            </div>


        </ChannelWrapper>
    );