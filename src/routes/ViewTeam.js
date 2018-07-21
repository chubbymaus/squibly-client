import React from 'react';
import Channels from '../components/Channels';
import Teams from '../components/Teams';
import Messages from '../components/Messages';
import Header from '../components/Header';
import Input from '../components/Input';
import AppLayout from '../components/AppLayout';

export default () => (
    <AppLayout>
        <Teams>Teams</Teams>
        <Channels>Channels</Channels>
        <Header>Header</Header>
        <Messages>
            <ul className="message-list">
                <li />
                <li />
            </ul>
        </Messages>
        <Input>
            <input type="text" placeholder="css Grid layout module" />
        </Input>
    </AppLayout>
);