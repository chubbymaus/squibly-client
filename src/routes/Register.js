import React, { Component } from 'react';
import {
  Container,
  Header,
  Input,
  Button
} from 'semantic-ui-react';
import { graphql } from "react-apollo";
import gql from "graphql-tag";
class Register extends Component {
  state = {
    username: '',
    email: '',
    password: '',
  };

  onSubmit = async () => {
    const response = this.props.mutate({
      variables: this.state,
    });

    console.log(response);
  };

  onChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  render() {
    const {username, email, password} = this.state;
    return (
    <Container text>
      <Header as='h2'>Register</Header>
      <Input name='username' onChange={this.onChange} value={username} placeholder='Username' fluid/>
      <Input name='email' onChange={this.onChange} value={email} placeholder='Email' fluid/>
      <Input name='password' onChange={this.onChange} value={password} placeholder='Password' type='password' fluid/>
      <Button onClick={this.onSubmit}>Submit</Button>
    </Container>
    );
  }
}

const registerMutation = gql`
  mutation($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password)
  }
`;

export default graphql(registerMutation)(Register);
