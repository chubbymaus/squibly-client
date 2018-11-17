import React from 'react';
import styled from 'styled-components';
import { Button, Icon, Input } from 'semantic-ui-react';
import { withFormik } from 'formik';

import FileUpload from './FileUpload';

const SendMessageWrapper = styled.div`
  grid-column: 3;
  padding: 20px;
  display: grid;
  grid-template-columns: 50px auto;
`;

const ENTER_KEY = 13;

const SendMessage = ({
    placeholder,
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setFieldValue,
    channelId,
    channelName,
    username,
    isDm,
    recipientUser
}) => {
    const encryptMessage = (e) => {

        if(channelName !== 'general' && isDm === false){
            window.Armored.encryptChannelMessage({sender: username, recipient: channelName, text: values.message }, sessionStorage.getItem('passphrase'))
                  .then((result) => {
                    console.log(result)  
                    setFieldValue('message', result.text);
                    setFieldValue('session_key', result.sessionkey);
                    setFieldValue('signature', result.signature);
                    handleSubmit(e);
                    return result;
                }).catch((err) => {
                    console.error(err)
                });
            // handleSubmit(e);
            } else if(recipientUser && channelName !== 'general'){
                window.Armored.encryptDirectMessage({sender: username, recipient: recipientUser, text: values.message }, sessionStorage.getItem('passphrase'))
                .then((result) => {
                  console.log(result)  
                  setFieldValue('message', result.text);
                  setFieldValue('session_key', result.sessionkey);
                  setFieldValue('signature', result.signature);
                  setFieldValue('sender_name', username);
                  setFieldValue('receiver_name', recipientUser);
                  handleSubmit(e);
                  return result;
              }).catch((err) => {
                  console.error(err)
              });
                window.Armored.encryptDirectMessage({sender: username, recipient: username, text: values.message }, sessionStorage.getItem('passphrase'))
                .then((result) => {
                  console.log(result)  
                  setFieldValue('message', result.text);
                  setFieldValue('session_key', result.sessionkey);
                  setFieldValue('signature', result.signature);
                  setFieldValue('sender_name', username);
                  setFieldValue('receiver_name', username);
                  handleSubmit(e);
                  return result;
              }).catch((err) => {
                  console.error(err)
              });
            } else {
            handleSubmit(e);
            return
        }
      };
        return(
        <SendMessageWrapper>
            <FileUpload channelId={channelId}>
                <Button icon>
                    <Icon name="plus" />
                </Button>
            </FileUpload>
            <Input
                onKeyDown={(e) => {
                    if (e.keyCode === ENTER_KEY && !isSubmitting) {
                        encryptMessage();
                        
                    }
                }}
                onChange={handleChange}
                onBlur={handleBlur}
                name="message"
                value={values.message}
                placeholder={`Message ${placeholder}`}
            />
            <Input
                style={{display:'none'}}
                onChange={handleChange}
                onBlur={handleBlur}
                name="session_key"
                value={values.session_key}
                placeholder={`session_key`}
            />
            <Input
                style={{display:'none'}}
                onChange={handleChange}
                onBlur={handleBlur}
                name="signature"
                value={values.signature}
                placeholder={`signature`}
            />
            <Input
                style={{display:'none'}}
                onChange={handleChange}
                onBlur={handleBlur}
                name="sender_name"
                value={values.sender_name}
                placeholder={`sender_name`}
            />
            <Input
                style={{display:'none'}}
                onChange={handleChange}
                onBlur={handleBlur}
                name="receiver_name"
                value={values.receiver_name}
                placeholder={`receiver_name`}
            />
        </SendMessageWrapper>
    )};

export default withFormik({
    mapPropsToValues: () => ({ message: '', session_key: '', signature: '', sender_name:'', receiver_name:'' }),
    handleSubmit: async (values, { props: { onSubmit }, setSubmitting, resetForm }) => {
        if (!values.message || !values.message.trim()) {
            setSubmitting(false);
            return;
        }

        await onSubmit(values.message, values.session_key, values.signature, values.sender_name, values.receiver_name);
        resetForm(false);
    },
})(SendMessage);