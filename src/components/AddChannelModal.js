import React from 'react';
import { Form, Button, Header, Input, Modal, Checkbox } from 'semantic-ui-react';
import { withFormik } from 'formik';
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";

import findIndex from 'lodash/findIndex';

import { meQuery } from '../graphql/team';
import MultiSelectUsers from './MultiSelectUsers';

const AddChannelModal = ({
    open,
    onClose,
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    resetForm,
    setFieldValue,
    teamId,
    currentUserId,
}) => {
    const setKeys = (e) => {
        window.Armored.createUserKeys
            (values.name, values.passphrase)
              .then((result) => {
                setFieldValue('publicKey', result.publicKeyBase64);
                setFieldValue('privateKey', result.privateKeyBase64);
                setFieldValue('sigPublicKey', result.sigPublicKeyBase64);
                setFieldValue('sigPrivateKey', result.sigPrivateKeyBase64);
                
                return result;
              }).catch((err) => {
                console.error(err)
              });
      };
      
      const RenderKeys = () => {
        if (!values.publicKey) {
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
              onChange={handleChange}
              value={values.publicKey}
              type="text"
              placeholder="Public Key"
              width={8} 
              fluid
              disabled
              label="Public Key"
            />
            <Form.Input
              name="privateKey"
              onChange={handleChange}
              value={values.privateKey}
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
              onChange={handleChange}
              value={values.sigPublicKey}
              type="text"
              placeholder="Signature Public Key"
              disabled
              width={8} 
              fluid
              label="Signature Public Key"
            />
            <Form.Input
              name="sigPrivateKey"
              onChange={handleChange}
              value={values.sigPrivateKey}
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
        return(
        <Modal open={open} onClose={(e) => {
            resetForm();
            onClose(e);
        }} size='tiny'>
            <Header>Create a New Channel</Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <Input
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            name="name"
                            fluid
                            placeholder='Channel Name...'
                        />
                    </Form.Field>
                    <Form.Field>
                        <Input
                            value={values.passphrase}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            name="passphrase"
                            fluid
                            placeholder='Channel passphrase...'
                        />
                    </Form.Field>
                    <Form.Field>
                        <Checkbox
                            checked={!values.public}
                            label="Private"
                            onChange={(e, { checked }) => setFieldValue('public', !checked)}
                            toggle
                        />
                    </Form.Field>
                    {values.public ? null : (
                        <Form.Field>
                            <MultiSelectUsers
                                value={values.members}
                                handleChange={(e, { value }) => setFieldValue('members', value)}
                                teamId={teamId}
                                placeholder="select members to invite"
                                currentUserId={currentUserId}
                            />
                        </Form.Field>
                    )}
                    <RenderKeys />
                    <Form.Group widths="equal">
                        <Button color='blue' disabled={isSubmitting} onClick={handleSubmit} compact fluid type="submit">Create Channel</Button>
                        <Button
                            color='red'
                            disabled={isSubmitting}
                            onClick={(e) => {
                                resetForm();
                                onClose(e);
                            }} compact fluid>Cancel</Button>
                    </Form.Group>

                </Form>
            </Modal.Content>

        </Modal>
)}

const createChannelMutation = gql`
    mutation($teamId: Int!, $name: String!, $public: Boolean, $passphrase: String!, $publicKey: String!, $privateKey: String!, $sigPublicKey: String!, $sigPrivateKey: String!, $members: [Int!]) {
      createChannel(teamId: $teamId, name: $name, public: $public, passphrase: $passphrase, publicKey: $publicKey, privateKey: $privateKey, sigPublicKey: $sigPublicKey, sigPrivateKey: $sigPrivateKey, members: $members) {
        ok
        channel {
          id
          name
          dm
        }
      }
    }
  `;

export default compose(
    graphql(createChannelMutation),
    withFormik({
        mapPropsToValues: () => ({ public: true, name: '', passphrase: '', publicKey: '', privateKey: '', sigPublicKey: '', sigPrivateKey: '', members: [] }),
        handleSubmit: async (values, { props: { onClose, teamId, mutate }, setSubmitting }) => {
            await mutate({
                variables: {
                    teamId,
                    name: values.name,
                    public: values.public,
                    passphrase: values.passphrase,
                    publicKey: values.publicKey,
                    privateKey: values.privateKey,
                    sigPublicKey: values.sigPublicKey,
                    sigPrivateKey: values.sigPrivateKey,
                    members: values.members,
                },
                optimisticResponse: {
                    createChannel: {
                        __typename: 'Mutation',
                        ok: true,
                        channel: {
                            __typename: 'Channel',
                            id: -1,
                            name: values.name,
                            dm: false,
                        },
                    },
                },
                update: (store, { data: { createChannel } }) => {
                    const { ok, channel } = createChannel;
                    if (!ok) {
                        return;
                    }

                    const data = store.readQuery({ query: meQuery });
                    const teamIdx = findIndex(data.me.teams, ['id', teamId]);
                    data.me.teams[teamIdx].channels.push(channel);
                    store.writeQuery({ query: meQuery, data });
                },
            });
            onClose();
            setSubmitting(false);
        },
    }),
)(AddChannelModal);