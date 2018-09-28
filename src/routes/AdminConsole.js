import React from 'react';
import { compose, graphql } from 'react-apollo';
import findIndex from 'lodash/findIndex';
import { Redirect } from 'react-router-dom';
import gql from 'graphql-tag';
import { Icon, Label, Menu, Table } from 'semantic-ui-react'
import DocsHeader from '../components/DocsHeader';
import AppLayout from '../components/AppLayout';
import Sidebar from '../containers/Sidebar';
import styled from 'styled-components';
import { meQuery } from '../graphql/team';
import NavBar from '../components/NavBar';


const AdminWrapper = styled.div`
  margin: 25px;
`
const AdminConsole = ({ mutate, data: { loading, me }, match: { params: { teamId, channelId } } }) => {
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
        <AdminWrapper>
         <h2>Squibly Explorer</h2>
         <Table celled>
            <Table.Header>
            <Table.Row>
                <Table.HeaderCell>Sender</Table.HeaderCell>
                <Table.HeaderCell>Receiver</Table.HeaderCell>
                <Table.HeaderCell>File Name</Table.HeaderCell>
                <Table.HeaderCell>Sent Date</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
            </Table.Header>

            <Table.Body>
            <Table.Row>
                <Table.Cell>Nick Saban</Table.Cell>
                <Table.Cell>Five Star Recruit</Table.Cell>
                <Table.Cell><Icon color='blue' name="file word outline" />Letter_Of_Intent.docx</Table.Cell>
                <Table.Cell>9/27/2018 11:57pm</Table.Cell>
                <Table.Cell>Unread</Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell>Nick Saban</Table.Cell>
                <Table.Cell>#Assistant Coaches</Table.Cell>
                <Table.Cell><Icon color='red' name="file powerpoint outline" />Meet_The_Team.pptx</Table.Cell>
                <Table.Cell>9/27/2018 11:37pm</Table.Cell>
                <Table.Cell>Read</Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell>Donor</Table.Cell>
                <Table.Cell>Nick Saban</Table.Cell>
                <Table.Cell><Icon color='blue' name="file word outline" />Donation_For_Recruiting.docx</Table.Cell>
                <Table.Cell>9/27/2018 11:32pm</Table.Cell>
                <Table.Cell>Read</Table.Cell>
            </Table.Row>
            </Table.Body>

            <Table.Footer>
            <Table.Row>
                <Table.HeaderCell colSpan='5'>
                <Menu floated='right' pagination>
                    <Menu.Item as='a' icon>
                    <Icon name='chevron left' />
                    </Menu.Item>
                    <Menu.Item as='a'>1</Menu.Item>
                    <Menu.Item as='a'>2</Menu.Item>
                    <Menu.Item as='a'>3</Menu.Item>
                    <Menu.Item as='a'>4</Menu.Item>
                    <Menu.Item as='a' icon>
                    <Icon name='chevron right' />
                    </Menu.Item>
                </Menu>
                </Table.HeaderCell>
            </Table.Row>
            </Table.Footer>
        </Table>
        </AdminWrapper>

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
)(AdminConsole);