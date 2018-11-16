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
    passphrase: "",
    passphrase_hint: "",
    public_key: "",
    private_key: "",
    sig_public_key: "",
    sig_private_key: "",
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

    const { username, email, password, firstname, lastname, jobtitle, passphrase_hint, public_key, private_key, sig_public_key, sig_private_key } = this.state;
    const response = await this.props.mutate({
      variables: { username, email, password, firstname, lastname, jobtitle, passphrase_hint, public_key, private_key, sig_public_key, sig_private_key }
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
      passphrase,
      passphrase_hint,
      public_key,
      private_key,
      sig_public_key,
      sig_private_key,
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
                public_key: result.publicKeyBase64,
                private_key: result.privateKeyBase64,
                sig_public_key: result.sigPublicKeyBase64,
                sig_private_key: result.sigPrivateKeyBase64,
              })
            }).catch((err) => {
              console.error(err)
            });
    };

    const RenderKeys = () => {
      if (this.state.public_key.length === 0 || this.state.private_key.length === 0 || this.state.sig_public_key.length === 0 || this.state.sig_private_key.length === 0) {
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
            name="public_key"
            onChange={this.onChange}
            value={public_key}
            type="text"
            placeholder="Public Key"
            width={8} 
            fluid
            disabled
            label="Public Key"
          />
          <Form.Input
            name="private_key"
            onChange={this.onChange}
            value={private_key}
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
            name="sig_public_key"
            onChange={this.onChange}
            value={sig_public_key}
            type="text"
            placeholder="Signature Public Key"
            disabled
            width={8} 
            fluid
            label="Signature Public Key"
          />
          <Form.Input
            name="sig_private_key"
            onChange={this.onChange}
            value={sig_private_key}
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
                <Form.Field>
                  <Input
                    name="passphrase"
                    onChange={this.onChange}
                    value={passphrase}
                    type='password'
                    placeholder="Passphrase"
                    fluid
                  />
                </Form.Field>
                <Form.Field>
                  <Input
                    name="passphrase_hint"
                    onChange={this.onChange}
                    value={passphrase_hint}
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
  mutation($firstname: String!, $lastname: String!, $jobtitle: String!, $passphrase_hint: String!, $public_key: String!, $private_key: String!, $sig_public_key: String!, $sig_private_key: String!, $username: String!, $email: String!, $password: String!) {
    register(firstname: $firstname, lastname: $lastname, jobtitle: $jobtitle, passphrase_hint: $passphrase_hint, public_key: $public_key, private_key: $private_key, sig_public_key: $sig_public_key, sig_private_key: $sig_private_key, username: $username, email: $email, password: $password) {
      ok
      errors {
        path
        message
      }
    }
  }
`;

export default graphql(registerMutation)(Register);
