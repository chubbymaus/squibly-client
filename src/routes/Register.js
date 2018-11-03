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
    firstName: "",
    lastName: "",
    jobTitle: "",
    passphrase: "",
    passphraseHint: "",
    publicKey: "",
    privateKey: "",
    sigPublicKey: "",
    sigPrivateKey: "",
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

    const { username, email, password, firstName, lastName, jobTitle, passphraseHint, publicKey, privateKey, sigPublicKey, sigPrivateKey } = this.state;
    const response = await this.props.mutate({
      variables: { username, email, password, firstName, lastName, jobTitle, passphraseHint, publicKey, privateKey, sigPublicKey, sigPrivateKey }
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
      firstName,
      lastName,
      jobTitle,
      passphrase,
      passphraseHint,
      publicKey,
      privateKey,
      sigPublicKey,
      sigPrivateKey,
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


    const setKeys = (e) => {
      window.Armored.createUserKeys(this.state.username, this.state.passphrase)
            .then((result) => {
              console.log(result)
              this.setState({
                publicKey: result.publicKeyBase64,
                privateKey: result.privateKeyBase64,
                sigPublicKey: result.sigPublicKeyBase64,
                sigPrivateKey: result.sigPrivateKeyBase64,
              })
            }).catch((err) => {
              console.error(err)
            });
    };

    const RenderKeys = () => {
      if (this.state.publicKey.length === 0 || this.state.privateKey.length === 0 || this.state.sigPublicKey.length === 0 || this.state.sigPrivateKey.length === 0) {
        return (
          <div>
          <Button onClick={setKeys} fluid style={{ backgroundColor: "#31c56e", color: "#fff" }}>Generate Keys</Button>
          <br/>
          </div>
        );
      } else {
        return (
          <div>
          <Form.Group>
          <Form.Input
            name="publicKey"
            onChange={this.onChange}
            value={publicKey}
            type="text"
            placeholder="Public Key"
            width={8} 
            fluid
            disabled
            label="Public Key"
          />
          <Form.Input
            name="privateKey"
            onChange={this.onChange}
            value={privateKey}
            type="text"
            placeholder="Private Key"
            disabled
            width={8} 
            fluid
            label="Private Key"
          />
      </Form.Group>
        <Form.Group>
          <Form.Input
            name="sigPublicKey"
            onChange={this.onChange}
            value={sigPublicKey}
            type="text"
            placeholder="Signature Public Key"
            disabled
            width={8} 
            fluid
            label="Signature Public Key"
          />
          <Form.Input
            name="sigPrivateKey"
            onChange={this.onChange}
            value={sigPrivateKey}
            type="text"
            disabled
            placeholder="Signature Private Key"
            width={8} 
            fluid
            label="Signature Private Key"
          />
      </Form.Group>
      </div>
        );
      }
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
                    name="firstName"
                    onChange={this.onChange}
                    value={firstName}
                    placeholder="First name"
                    width={8} 
                    fluid
                  />
                  <Form.Input
                    name="lastName"
                    onChange={this.onChange}
                    value={lastName}
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
                    name="jobTitle"
                    onChange={this.onChange}
                    value={jobTitle}
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
                <Form.Field>
                  <Input
                    name="passphrase"
                    onChange={this.onChange}
                    value={passphrase}
                    placeholder="Passphrase"
                    fluid
                  />
                </Form.Field>
                <Form.Field>
                  <Input
                    name="passphraseHint"
                    onChange={this.onChange}
                    value={passphraseHint}
                    placeholder="Passphrase Hint"
                    fluid
                  />
                </Form.Field>

                <RenderKeys />
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
  mutation($firstName: String!, $lastName: String!, $jobTitle: String!, $passphraseHint: String!, $publicKey: String!, $privateKey: String!, $sigPublicKey: String!, $sigPrivateKey: String!, $username: String!, $email: String!, $password: String!) {
    register(firstName: $firstName, lastName: $lastName, jobTitle: $jobTitle, passphraseHint: $passphraseHint, publicKey: $publicKey, privateKey: $privateKey, sigPublicKey: $sigPublicKey, sigPrivateKey: $sigPrivateKey, username: $username, email: $email, password: $password) {
      ok
      errors {
        path
        message
      }
    }
  }
`;

export default graphql(registerMutation)(Register);
