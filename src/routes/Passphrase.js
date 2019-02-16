import React, { Component } from "react";
import { Form, Container, Header, Input, Button } from "semantic-ui-react";
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


class Passphrase extends Component {
  state = {
    passphrase: "",
  };

  onSubmit = async () => {
    sessionStorage.setItem( "passphrase", this.state.passphrase);
    // global.passphrase = prompt('passphrase')
    this.props.history.push("/view-team");
  };

  onChange = (e) => {
    const { name, value } = e.target;
    // name = "email";
    this.setState({ [name]: value });
  };

  render() {
    const {
      passphrase,
    } = this.state;
   
    return (
      <div>
        <NavBar />
        <CenterForm>
          <Container text>
            <Card>
              <Header as="h2">Please Enter Your Unique Passphrase</Header>
              <Form>
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
                <Button onClick={this.onSubmit} fluid style={{ backgroundColor: "#31c56e", color: "#fff" }}>Submit</Button>
              </Form>
            </Card>
          </Container>
        </CenterForm>
      </div>
    );
  }
}

export default Passphrase;
