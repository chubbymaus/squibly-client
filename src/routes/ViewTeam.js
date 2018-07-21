import React from 'react';
import Channels from '../components/Channels';
import Teams from '../components/Teams';
import Messages from '../components/Messages';
import Header from '../components/Header';
import SendMessage from '../components/SendMessage';
import AppLayout from '../components/AppLayout';

export default () => (
    <AppLayout>
        <Teams teams={[{ id: 1, letter: "T" }, { id: 2, letter: "S" }]} />
        <Channels
            teamName="Team Name"
            userName="Username"
            channels={[{ id: 1, name: "general" }, { id: 2, name: "random" }]}
            users={[{ id: 1, name: "squiblybot" }, { id: 2, name: "user1" }]}
        />
        <Header channelName="general" />
        <Messages>
            <ul className="message-list">
                <li />
                <li />
            </ul>
        </Messages>
        <SendMessage channelName="general" />
    </AppLayout>
);