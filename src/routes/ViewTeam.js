import React from 'react';
import { compose, graphql } from 'react-apollo';
import findIndex from 'lodash/findIndex';
import { Redirect } from 'react-router-dom';
import gql from 'graphql-tag';

import Header from '../components/Header';
import SendMessage from '../components/SendMessage';
import AppLayout from '../components/AppLayout';
import Sidebar from '../containers/Sidebar';
import MessageContainer from '../containers/MessageContainer';
import { meQuery } from '../graphql/team';
import NavBar from '../components/NavBar';
// import axios from 'axios'


const ViewTeam = ({ mutate, data: { loading, me }, match: { params: { teamId, channelId } } }) => {
  if (loading || !me) {
    return null;
  }
  
  const { id: currentUserId, username, teams,  } = me;
  // const userId = me.id;
  //   axios.get(
  //     `http://localhost:8080/graphql?query={getUserPrivateKeys(userId:${userId}){id,private_key,sig_private_key}}`
  //   ).then((result) => {
  //     console.log(result.data)
  //   })

  if (!teams.length) {
    return <Redirect to="/create-team" />;
  }

  const teamIdInteger = parseInt(teamId, 10);
  const teamIdx = teamIdInteger ? findIndex(teams, ['id', teamIdInteger]) : 0;
  const team = teamIdx === -1 ? teams[0] : teams[teamIdx];

  const channelIdInteger = parseInt(channelId, 10);
  const channelIdx = channelIdInteger ? findIndex(team.channels, ['id', channelIdInteger]) : 0;
  const channel = channelIdx === -1 ? team.channels[0] : team.channels[channelIdx];

  return (
    <div>
      <NavBar />
      <AppLayout>
        <Sidebar
          teams={teams.map(t => ({
            id: t.id,
            letter: t.name.charAt(0).toUpperCase(),
          }))}
          team={team}
          username={username}
          currentUserId={currentUserId}
        />
        {channel && <Header channelName={channel.name} />}
        {channel && <MessageContainer channelId={channel.id} channelName={channel.name} isDm={channel.dm} />}
        {channel && (
          <SendMessage
            channelId={channel.id}
            username={username}
            isDm={channel.dm}
            channelName={channel.name}
            placeholder={channel.name}
            onSubmit={async (text, session_key, signature) => {
              await mutate({ variables: { text, session_key, signature, channelId: channel.id } });
            }}
          />
        )}

      </AppLayout>
    </div>
  );
};

const createMessageMutation = gql`
  mutation($channelId: Int!, $text: String!, $session_key: String, $signature:String) {
    createMessage(channelId: $channelId, text: $text, session_key: $session_key, signature: $signature)
  }
`;

export default compose(
  graphql(meQuery, { options: { fetchPolicy: 'network-only' } }),
  graphql(createMessageMutation),
)(ViewTeam);