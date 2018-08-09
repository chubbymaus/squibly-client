import React from 'react';
import { Form, Button, Header, Input, Modal } from 'semantic-ui-react';
import { withFormik } from 'formik';
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";

import normalizeErrors from '../normalizeErrors';



const InvitePeopleModal = ({
    open,
    onClose,
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    resetForm,
    touched,
    errors
}) => (
        <Modal open={open} onClose={(e) => {
            resetForm();
            onClose(e);
        }} size='tiny'>
            <Header>Add a User to your team...</Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <Input
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            name="email"
                            fluid
                            placeholder='Users email...'
                        />
                    </Form.Field>
                    {touched.email && errors.email ? errors.email[0] : null}
                    <Form.Group widths="equal">
                        <Button color='blue' disabled={isSubmitting} onClick={handleSubmit} compact fluid type="submit">Add User</Button>
                        <Button color='red' disabled={isSubmitting} 
                         onClick={(e) => {
                            resetForm();
                            onClose(e);
                        }}
                        compact fluid>Cancel</Button>
                    </Form.Group>

                </Form>
            </Modal.Content>

        </Modal>
    )

const addTeamMemberMutation = gql`
    mutation($email: String!, $teamId: Int!) {
      addTeamMember(email: $email, teamId: $teamId) {
        ok
        errors {
          path
          message
        }
      }
    }
  `;

export default compose(
    graphql(addTeamMemberMutation),
    withFormik({
        mapPropsToValues: () => ({ email: '' }),
        handleSubmit: async (
            values,
            { props: { onClose, teamId, mutate }, setSubmitting, setErrors },
        ) => {
            const response = await mutate({
                variables: { teamId, email: values.email },
            });
            const { ok, errors } = response.data.addTeamMember;
            if (ok) {
                    onClose();
                    setSubmitting(false);
                } else {
                    setSubmitting(false);
                    const errorsLength = errors.length;
                    const filteredErrors = errors.filter(e => e.message !== 'user_id must be unique');
                    if (errorsLength !== filteredErrors.length) {
                    filteredErrors.push({
                        path: 'email',
                        message: 'This user is already part of the team',
                    });
                    }
                    setErrors(normalizeErrors(filteredErrors));
                }
                },
        }),
)(InvitePeopleModal);
