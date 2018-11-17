import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Comment } from 'semantic-ui-react';
import moment from 'moment';
import Messages from '../components/Messages';

const newDirectMessageSubscription = gql`
  subscription($teamId: Int!, $userId: Int!) {
    newDirectMessage(teamId: $teamId, userId: $userId) {
      id
      sender {
        username
      }
      receiver {
        username
      }
      text
      created_at
      session_key
      signature
    }
  }
`;
class Message extends React.Component {
    state = {
      recipientUser: this.props.recipientUser,
      sessionkey: this.props.sessionkey,
      signature: this.props.signature,
      user: this.props.user,
      text: this.props.text,
      isDm: this.props.isDm
    }
  
  render(){
        const {
            recipientUser,
            user,
            receivingUser
        } = this.props;

        if( this.props.currentUser !== this.state.user && this.props.currentUser !== this.state.recipientUser ){
            return null
        }
        if( this.props.currentUser !== this.state.user ){
        window.Armored.decryptDirectMessage({ recipient: this.state.recipientUser, sender: this.state.user, text: this.state.text, sessionkey: this.state.sessionkey, signature: this.state.signature }, sessionStorage.getItem(`passphrase`))
        .then((result) => {
            console.log('BEFORE_CHANGE: '+this.state.text)
            this.setState({
            text: result.text, 
            })
            console.log('AFTER_RETURNING: '+ this.state.text)
        
        }).catch((err) => {
            console.error(err)
        })
        } else {
        window.Armored.decryptDirectMessage({ recipient: this.state.user, sender: this.state.user, text: this.state.text, sessionkey: this.state.sessionkey, signature: this.state.signature }, sessionStorage.getItem(`passphrase`))
          .then((result) => {
            console.log('BEFORE_CHANGE: '+this.state.text)
            this.setState({
              text: result.text, 
            })
            console.log('AFTER_RETURNING: '+ this.state.text)
           
          }).catch((err) => {
            console.error(err)
          })

    }
   
    return (
        <div>
            <Comment.Text>{this.state.text}</Comment.Text>
            <Comment.Text>recipient:{recipientUser}</Comment.Text>
            <Comment.Text>user:{user}</Comment.Text>
            <Comment.Text>receiver:{receivingUser}</Comment.Text>
            </div>
        )
  
    }};

class DirectMessageContainer extends React.Component {
    componentWillMount() {
        this.unsubscribe = this.subscribe(this.props.teamId, this.props.userId);
    }

    componentWillReceiveProps({ teamId, userId }) {
        if (this.props.teamId !== teamId || this.props.userId !== userId) {
            if (this.unsubscribe) {
                this.unsubscribe();
            }
            this.unsubscribe = this.subscribe(teamId, userId);
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    subscribe = (teamId, userId) =>
        this.props.data.subscribeToMore({
            document: newDirectMessageSubscription,
            variables: {
                teamId,
                userId,
            },
            updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData) {
                    return prev;
                }

                return {
                    ...prev,
                    directMessages: [...prev.directMessages, subscriptionData.data.newDirectMessage],
                };
            },
        });

    render() {
        const { data: { loading, directMessages }, currentUser, receivingUser } = this.props;

        return loading ? null : (
            <Messages>
                <Comment.Group>
                    {directMessages.map(m => (
                        <Comment key={`${m.id}-direct-message`}>
                            <Comment.Content>
                                <Comment.Author as="a">{m.sender.username}</Comment.Author>
                                <Comment.Metadata>
                                    <div>{moment(m.created_at).format('LLL')}</div>
                                </Comment.Metadata>
                                <Message recipientUser={m.receiver.username} currentUser={currentUser} receivingUser={receivingUser} text={m.text} sessionkey={m.session_key} signature={m.signature} user={m.sender.username} message={m}/>
                            </Comment.Content>
                        </Comment>
                    ))}
                </Comment.Group>
            </Messages>
        );
    }
}

const directMessagesQuery = gql`
  query($teamId: Int!, $userId: Int!) {
    directMessages(teamId: $teamId, otherUserId: $userId) {
      id
      sender {
        username
      }
      receiver {
        username
      }
      text
      created_at
      session_key
      signature
    }
  }
`;

export default graphql(directMessagesQuery, {
    options: props => ({
        fetchPolicy: 'network-only',
        variables: {
            teamId: props.teamId,
            userId: props.userId,
        },
    }),
})(DirectMessageContainer);