import React from 'react';
import { compose, graphql } from 'react-apollo';
import findIndex from 'lodash/findIndex';
import { Redirect } from 'react-router-dom';
import gql from 'graphql-tag';

import DocsHeader from '../components/DocsHeader';
import AppLayout from '../components/AppLayout';
import Sidebar from '../containers/Sidebar';
import DocsContainer from '../containers/DocsContainer';
import { meQuery } from '../graphql/team';
import NavBar from '../components/NavBar';


const ViewTeam = ({ mutate, data: { loading, me }, match: { params: { teamId, channelId } } }) => {
  if (loading || !me) {
    return null;
  }

  const { id: currentUserId, username, teams } = me;

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
        {channel && <DocsHeader channelName={channel.name} />}
        {channel && <DocsContainer channelId={channel.id} />}
        

      </AppLayout>
    </div>
  );
};

const createMessageMutation = gql`
  mutation($channelId: Int!, $text: String!) {
    createMessage(channelId: $channelId, text: $text)
  }
`;

export default compose(
  graphql(meQuery, { options: { fetchPolicy: 'network-only' } }),
  graphql(createMessageMutation),
)(ViewTeam);