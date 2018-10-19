import React, { Component } from "react";
import { Form, Message, Container, Header, Input, Button } from "semantic-ui-react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import styled from 'styled-components';
import NavBar from '../components/NavBar';

const CenterForm = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 95vh;
  background-color: #2a3443;
`
const Card = styled.div`
    background-color: #fefefe;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12), 0 3px 1px -2px rgba(0,0,0,0.2);
    padding: 2rem;
    
    border-radius: .20rem;
    margin: 1rem .5rem;
    
`;


class Register extends Component {
  state = {
    username: "",
    usernameError: "",
    firstname: "",
    lastname: "",
    jobtitle: "",
    email: "",
    emailError: "",
    password: "",
    passwordError: ""
  };

  onSubmit = async () => {
    this.setState({
      usernameError: "",
      emailError: "",
      passwordError: ""
    });

    const { username, email, password, firstname, lastname, jobtitle } = this.state;
    const response = await this.props.mutate({
      variables: { username, email, password, firstname, lastname, jobtitle }
    });

    const { ok, errors } = response.data.register;

    if (ok) {
      this.props.history.push("/login");
    } else {
      const err = {};
      errors.forEach(({ path, message }) => {
        // err['passwordError'] = 'too long..';
        err[`${path}Error`] = message;
      });

      this.setState(err);
    }

    console.log(response);
  };

  onChange = (e) => {
    const { name, value } = e.target;
    // name = "email";
    this.setState({ [name]: value });
  };

  render() {
    const {
      username,
      email,
      password,
      firstname,
      lastname,
      jobtitle,
      usernameError,
      emailError,
      passwordError
    } = this.state;

    const errorList = [];

    if (usernameError) {
      errorList.push(usernameError);
    }

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
              <Header as="h2">Register</Header>
              <Form>
              <Form.Group>
                  <Form.Input
                    name="firstname"
                    onChange={this.onChange}
                    value={firstname}
                    placeholder="First name"
                    width={8} 
                    fluid
                  />
                  <Form.Input
                    name="lastname"
                    onChange={this.onChange}
                    value={lastname}
                    placeholder="Last name"
                    width={8} 
                    fluid
                  />
              </Form.Group>
                <Form.Field error={!!usernameError}>
                  <Input
                    name="username"
                    onChange={this.onChange}
                    value={username}
                    placeholder="Username"
                    fluid
                  />
                </Form.Field>
                <Form.Field>
                  <Input
                    name="jobtitle"
                    onChange={this.onChange}
                    value={jobtitle}
                    placeholder="Job Title"
                    fluid
                  />
                </Form.Field>
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
                <Button onClick={this.onSubmit} fluid style={{ backgroundColor: "#31c56e", color: "#fff" }}>Submit</Button>
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

const registerMutation = gql`
  mutation($firstname: String!, $lastname: String!, $jobtitle: String!, $username: String!, $email: String!, $password: String!) {
    register(firstname: $firstname, lastname: $lastname, jobtitle: $jobtitle, username: $username, email: $email, password: $password) {
      ok
      errors {
        path
        message
      }
    }
  }
`;

export default graphql(registerMutation)(Register);
