import React from 'react';
import { compose, graphql } from 'react-apollo';
import findIndex from 'lodash/findIndex';
import { Redirect } from 'react-router-dom';
import gql from 'graphql-tag';

import Header from '../components/Header';
import SendMessage from '../components/SendMessage';
import AppLayout from '../components/AppLayout';
import Sidebar from '../containers/Sidebar';
import DirectMessageContainer from '../containers/DirectMessageContainer';
import { meQuery } from '../graphql/team';
import NavBar from '../components/NavBar';

const ViewTeam = ({ mutate, data: { loading, me, getUser }, match: { params: { teamId, userId } }, }) => {
    if (loading) {
        return null;
    }

    const { username, teams } = me;

    if (!teams.length) {
        return <Redirect to="/create-team" />;
    }

    const teamIdInteger = parseInt(teamId, 10);
    const teamIdx = teamIdInteger ? findIndex(teams, ['id', teamIdInteger]) : 0;
    const team = teamIdx === -1 ? teams[0] : teams[teamIdx];

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
                />
                <Header channelName={getUser.username} />
                <DirectMessageContainer teamId={team.id} receivingUser={getUser.username} currentUser={username} userId={userId} />
                <SendMessage
                    onSubmit={async (text, session_key, signature, sender_name, receiver_name) => {
                        const response = await mutate({
                            variables: {
                                text,
                                receiverId: userId,
                                teamId,
                                session_key, 
                                signature,
                                sender_name,
                                receiver_name
                            },
                            optimisticResponse: {
                                createDirectMessage: true,
                            },
                            update: (store) => {
                                const data = store.readQuery({ query: meQuery });
                                const teamIdx2 = findIndex(data.me.teams, ['id', team.id]);
                                const notAlreadyThere = data.me.teams[teamIdx2].directMessageMembers.every(member => member.id !== parseInt(userId, 10));
                                if (notAlreadyThere) {
                                    data.me.teams[teamIdx2].directMessageMembers.push({
                                        __typename: 'User',
                                        id: userId,
                                        username: getUser.username,
                                    });
                                    store.writeQuery({ query: meQuery, data });
                                }
                            },
                        });
                        console.log(response);
                    }}
                    placeholder={getUser.username}
                    recipientUser={getUser.username}
                    username={username}
                />
            </AppLayout>
        </div>
    );
};

const createDirectMessageMutation = gql`
  mutation($receiverId: Int!, $text: String!, $teamId: Int!, $sender_name: String!, $receiver_name: String!, $session_key: String, $signature:String) {
    createDirectMessage(receiverId: $receiverId, text: $text, teamId: $teamId, sender_name: $sender_name, receiver_name: $receiver_name, session_key: $session_key, signature: $signature)
  }
`;

const directMessageMeQuery = gql`
  query($userId: Int!) {
    getUser(userId: $userId) {
      username
    }
    me {
      id
      username
      teams {
        id
        name
        admin
        directMessageMembers {
          id
          username
        }
        channels {
          id
          name
        }
      }
    }
  }
`;

export default compose(
    graphql(directMessageMeQuery, {
        options: props => ({
            variables: {
                userId: props.match.params.userId,
            },
            fetchPolicy: 'network-only',
        }),
    }),
    graphql(createDirectMessageMutation),
)(ViewTeam);