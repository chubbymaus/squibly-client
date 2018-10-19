import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Comment, Icon } from 'semantic-ui-react';

import FileUpload from '../components/FileUpload';
import RenderText from '../components/RenderText';
import styled from 'styled-components';

const FileContainer =  styled.div`
.hiddenMessage{
  display: none;
  margin: 0;
  padding: 0;
}
a {
  color: #2a3443;
}
`;

const newChannelMessageSubscription = gql`
  subscription($channelId: Int!) {
    newChannelMessage(channelId: $channelId) {
      id
      text
      user {
        username
      }
      url
      filename
      filetype
      created_at
    }
  }
`;

const Message = ({ message: { url, text, filetype, filename } }) => {
  if (url) {
    if (filetype.startsWith('image/')) {
      return (
        <div className="hiddenMessage">
            <img src={url} alt="" />
            <a href={url} download={filename}>Click to download</a>
        </div>
      );
    } else if (filetype === 'text/plain') {
      return <RenderText url={url} />;
    } else if (filetype.startsWith('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      return (
        <div>
            <h3> 
            <a href={url} download={filename} type={filetype}><Icon color='green' name="file alternate outline" />{filename}</a></h3>
        </div>
      );
    }
     else  {
      return (
        <div>
            <h3> 
            <a href={url} download={filename} type={filetype}><Icon color='blue' name="file alternate outline" />{filename}</a></h3>
        </div>
      );
    }
  }
  return <Comment.Text className="hiddenMessage">{text}</Comment.Text>;
};

class DocsContainer extends React.Component {
  state = {
    hasMoreItems: true,
  };

  componentWillMount() {
    this.unsubscribe = this.subscribe(this.props.channelId);
  }

  componentWillReceiveProps({ data: { messages }, channelId }) {
    if (this.props.channelId !== channelId) {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      this.unsubscribe = this.subscribe(channelId);
    }

    if (
      this.scroller &&
      this.scroller.scrollTop < 20 &&
      this.props.data.messages &&
      messages &&
      this.props.data.messages.length !== messages.length
    ) {
      // 35 items
      const heightBeforeRender = this.scroller.scrollHeight;
      // wait for 70 items to render
      setTimeout(() => {
        if (this.scroller) {
          this.scroller.scrollTop = this.scroller.scrollHeight - heightBeforeRender;
        }
      }, 120);
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  subscribe = channelId =>
    this.props.data.subscribeToMore({
      document: newChannelMessageSubscription,
      variables: {
        channelId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData) {
          return prev;
        }

        return {
          ...prev,
          messages: [subscriptionData.data.newChannelMessage, ...prev.messages],
        };
      },
    });

  handleScroll = () => {
    const { data: { messages, fetchMore }, channelId } = this.props;
    if (
      this.scroller &&
      this.scroller.scrollTop < 100 &&
      this.state.hasMoreItems &&
      messages.length >= 35
    ) {
      fetchMore({
        variables: {
          channelId,
          cursor: messages[messages.length - 1].created_at,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult;
          }

          if (fetchMoreResult.messages.length < 35) {
            this.setState({ hasMoreItems: false });
          }

          return {
            ...previousResult,
            messages: [...previousResult.messages, ...fetchMoreResult.messages],
          };
        },
      });
    }
  };

  render() {
    const { data: { loading, messages }, channelId } = this.props;
    return loading ? null : (
      <FileContainer
        style={{
          gridColumn: 3,
          gridRow: 2,
          paddingLeft: '20px',
          paddingRight: '20px',
          display: 'flex',
          
          overflowY: 'auto',
        }}
        onScroll={this.handleScroll}
        ref={(scroller) => {
          this.scroller = scroller;
        }}
      >
        <FileUpload
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
          channelId={channelId}
          disableClick
        >
          <Comment.Group>
            {messages
              .slice()
              .reverse()
              .map(m => (
                <Comment key={`${m.id}-message`}>
                  <Comment.Content>
                    
                    <Message message={m} />
                  </Comment.Content>
                </Comment>
              ))}
          </Comment.Group>
        </FileUpload>
      </FileContainer>
    );
  }
}

const messagesQuery = gql`
  query($cursor: String, $channelId: Int!) {
    messages(cursor: $cursor, channelId: $channelId) {
      id
      text
      user {
        username
      }
      url
      filename
      filetype
      
      created_at
    }
  }
`;

export default graphql(messagesQuery, {
  options: props => ({
    fetchPolicy: 'network-only',
    variables: {
      channelId: props.channelId,
    },
  }),
})(DocsContainer);