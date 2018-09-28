import React, { Component } from "react";
import { extendObservable } from "mobx";
import { observer } from "mobx-react";
import { Form, Message, Container, Header, Input, Button } from "semantic-ui-react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import NavBar from '../components/NavBar';
import styled from 'styled-components'

const CenterForm = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 94vh;
  background-color: #2a3443;
`
const Card = styled.div`
    background-color: #fefefe;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12), 0 3px 1px -2px rgba(0,0,0,0.2);
    padding: 2rem;
    border-radius: .20rem;
    
`;

class CreateTeam extends Component {
    constructor(props) {
        super(props);

        extendObservable(this, {
            name: "",
            errors: {},
        });
    }

    onSubmit = async () => {
        const { name } = this;
        let response = null;

        try {
            response = await this.props.mutate({
                variables: { name }
            });
        } catch (err) {
            this.props.history.push('/login');
            return;
        }
        console.log(response);

        const { ok, errors, team } = response.data.createTeam;

        if (ok) {
            this.props.history.push(`/view-team/${team.id}`);
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
        const { name, errors: { nameError, } } = this;

        const errorList = [];

        if (nameError) {
            errorList.push(nameError);
        }

        return (
            <div>
                <NavBar />
                <CenterForm>
                    <Container text>
                        <Card>
                            <Header as="h2">Create a Team</Header>
                            <Form>
                                <Form.Field error={!!nameError}>
                                    <Input
                                        name="name"
                                        onChange={this.onChange}
                                        value={name}
                                        placeholder="Team Name"
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

const createTeamMutation = gql`
  mutation($name: String!) {
    createTeam(name: $name) {
      ok
      team {
          id
      }
      errors {
        path
        message
      }
    }
  }
`;

export default graphql(createTeamMutation)(observer(CreateTeam));
