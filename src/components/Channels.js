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

const channel = ({ id, name }, teamId) => {
    const setPassphrase = (e) => {
        if (sessionStorage.getItem(`${name}-passphrase`)===null && name !== 'general'){
            sessionStorage.setItem( `${name}-passphrase`, prompt("channel passphrase"));
        }
        return
    }
    return(
    <Link key={`channel-${id}`} onClick={setPassphrase} to={`/view-team/${teamId}/${id}`}>
        <SideBarListItem>
            # {name}
        </SideBarListItem>
    </Link>
)};

const user = ({ id, username }, teamId,) => {

    return(
    <Link key={`user-${id}`} to={`/view-team/user/${teamId}/${id}`} >
        <SideBarListItem>
            <Bubble /> {username}
        </SideBarListItem>
    </Link>
    )
};

export default ({
    teamName,
    username,
    channels,
    users,
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
                    {users.map(u => user(u, teamId))}
                    </SideBarList>
            </div>
            <div>
                <SideBarList>
                    <SideBarListHeader>
                        <Link to="/view-docs">
                         <h4><Icon name="file alternate outline" /> Documents</h4>
                        </Link>
                    </SideBarListHeader>
                </SideBarList>
            </div>


        </ChannelWrapper>
    );