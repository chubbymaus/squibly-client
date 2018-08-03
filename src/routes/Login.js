import React, { Component } from "react";
import { extendObservable } from "mobx";
import { observer } from "mobx-react";
import { Form, Message, Container, Header, Input, Button } from "semantic-ui-react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import styled from 'styled-components';
import NavBar from '../components/NavBar';

const CenterForm = styled.div `
      display: flex;
  justify-content: space-between;
  align-items: center;
  height: 91.5vh;
  background-color: #2a3443;
`
const Card = styled.div `
    background-color: #fefefe;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12), 0 3px 1px -2px rgba(0,0,0,0.2);
    padding: 2rem;
    
    border-radius: .20rem;
    margin: 1rem .5rem;
    
`;

class Login extends Component {
  constructor(props) {
    super(props);

    extendObservable(this, {
      email: "",
      password: "",
      errors: {},
    });
  }

  onSubmit = async () => {
    const { email, password } = this;
    const response = await this.props.mutate({
      variables: { email, password }
    });

    console.log(response);

    const { ok, token, refreshToken, errors } = response.data.login;

    if (ok) {
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      this.props.history.push("/view-team");
    } else {
      const err = {};
      errors.forEach(({ path, message }) => {
        // err['passwordError'] = 'too long..';
        err[`${path}Error`] = message;
      });

      this.errors = err;
    }
  };

  onChange = (e) => {
    const { name, value } = e.target;
    this[name] = value;
  };

  render() {
    const { email, password, errors: { emailError, passwordError } } = this;

    const errorList = [];

    if (emailError) {
      errorList.push(emailError);
    }

    if (passwordError) {
      errorList.push(passwordError);
    }

    return (
      <div>
      <NavBar />
      <CenterForm>
      <Container text>
      <Card>
        <Header as="h2">Login</Header>
        <Form>
          <Form.Field error={!!emailError}>
            <Input
              name="email"
              onChange={this.onChange}
              value={email}
              placeholder="Email"
              fluid
            />
          </Form.Field>
          <Form.Field error={!!passwordError}>
            <Input
              name="password"
              onChange={this.onChange}
              value={password}
              type="password"
              placeholder="Password"
              fluid
            />
          </Form.Field>
          <Button onClick={this.onSubmit} fluid style={{backgroundColor:"#31c56e", color:"#fff"}}>Submit</Button>
        </Form>
        {errorList.length ? (
          <Message
            error
            header="There was some errors with your submission"
            list={errorList}
          />
        ) : null}
        </Card>
      </Container>
      </CenterForm>
      </div>
    );
  }
}

const loginMutation = gql`
  mutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ok
      token
      refreshToken
      errors {
        path
        message
      }
    }
  }
`;

export default graphql(loginMutation)(observer(Login));
