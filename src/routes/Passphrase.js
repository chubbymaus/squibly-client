import React from "react";
import { Form, Container, Header, Input, Button } from "semantic-ui-react";
import { graphql, compose } from "react-apollo";

import { withFormik } from 'formik';
import styled from 'styled-components';
import NavBar from '../components/NavBar';
import { passphraseQuery } from '../graphql/team';
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


const Passphrase = ({
    data: { loading, me },
    values,
    handleChange,
    handleBlur,

}) => {
    if (loading || !me) {
      return null;
    }
  
    const { passphrase, publicKey, privateKey, sigPublicKey, sigPrivateKey } = me;
    const getUserKeys = (e) => {
        if (values.passphrase === passphrase){
          
            localStorage.setItem("publicKey", publicKey)
            localStorage.setItem("privateKey", privateKey)
            localStorage.setItem("sigPublicKey", sigPublicKey)
            localStorage.setItem("sigPrivateKey", sigPrivateKey)
            window.location = '/view-team';
        } else {
            alert('not today satan')
        }  
    }
    return (
      <div>
        <NavBar />
        <CenterForm>
          <Container text>
            <Card>
              <Header as="h2">Enter your Passphrase</Header>
              <Form>

               
                <Form.Field>
                  <Input
                    value={values.passphrase}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="passphrase"
                    fluid
                    placeholder='passphrase...'
                  />
                </Form.Field>

                <Button onClick={getUserKeys} fluid style={{ backgroundColor: "#31c56e", color: "#fff" }}>Submit</Button>
              </Form>
              
            </Card>
          </Container>
        </CenterForm>
      </div>
    );
  }




export default compose(
    graphql(passphraseQuery, { options: { fetchPolicy: 'network-only' }}),
    withFormik({
        mapPropsToValues: () => ({ passphrase: '' }),
        handleSubmit: async (values, { props: { onSubmit }, setSubmitting, resetForm }) => {
            if (!values.passphrase) {
                setSubmitting(false);
                return;
            }

         
            resetForm(false);
        },
    }))(Passphrase);
