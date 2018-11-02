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
    isDm
}) => {
    // const encryptMessage = (e) => {
    //     if(isDm === true){
            
    //         window.Armored.encryptDirectMessage({sender: username, recipient: channelName, text: values.message }, 'values.passphrase')
    //               .then((result) => {
    //                 setFieldValue('message', result);
    //                 return result;
    //               }).catch((err) => {
    //                 console.error(err)
    //               });
    //     } else {
            
    //         window.Armored.encryptChannelMessage({sender: username, recipient: channelName, text: values.message }, 'values.passphrase')
    //               .then((result) => {
    //                 setFieldValue('message', result);
    //                 return result;
    //               }).catch((err) => {
    //                 console.error(err)
    //               });
    //     }
      
    //   };
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
                        // encryptMessage();
                        handleSubmit(e);
                    }
                }}
                onChange={handleChange}
                onBlur={handleBlur}
                name="message"
                value={values.message}
                placeholder={`Message ${placeholder}`}
            />
        </SendMessageWrapper>
    )};

export default withFormik({
    mapPropsToValues: () => ({ message: '' }),
    handleSubmit: async (values, { props: { onSubmit }, setSubmitting, resetForm }) => {
        if (!values.message || !values.message.trim()) {
            setSubmitting(false);
            return;
        }

        await onSubmit(values.message);
        resetForm(false);
    },
})(SendMessage);