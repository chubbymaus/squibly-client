import React from 'react';
import { Form, Input, Button, Modal } from 'semantic-ui-react';
import Downshift from 'downshift';

import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';

import { getTeamMembersQuery } from '../graphql/team';

const DirectMessageModal = ({
    history,
    open,
    onClose,
    teamId,
    data: { loading, getTeamMembers },
}) => (
        <Modal open={open} onClose={onClose}>
            <Modal.Header>Send A Direct Message</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        {!loading && (
                            <Downshift
                                onChange={(selectedUser) => {
                                    history.push(`/view-team/user/${teamId}/${selectedUser.id}`);
                                    onClose();
                                }}>
                                {({
                                    getInputProps,
                                    getItemProps,
                                    isOpen,
                                    inputValue,
                                    selectedItem,
                                    highlightedIndex,
                                }) => (
                                        <div>
                                            <Input {...getInputProps({ placeholder: 'Who do you want to message?' })} fluid />
                                            {isOpen ? (
                                                <div style={{ border: '1px solid #ccc', borderRadius: '3px' }}>
                                                    {getTeamMembers
                                                        .filter(i =>
                                                            !inputValue ||
                                                            i.username.toLowerCase().includes(inputValue.toLowerCase()))
                                                        .map((item, index) => (
                                                            <div
                                                                {...getItemProps({ item })}
                                                                key={item.id}
                                                                style={{
                                                                    backgroundColor: highlightedIndex === index ? '#31c56e' : 'white',
                                                                    color: highlightedIndex === index ? '#fff' : '#333',
                                                                    fontWeight: selectedItem === item ? 'bold' : 'normal',
                                                                    paddingLeft: '10px',

                                                                }}
                                                            >
                                                                {item.username}
                                                            </div>
                                                        ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                            </Downshift>
                        )}
                    </Form.Field>
                    <Button fluid onClick={onClose} style={{ backgroundColor: '#f45c57', color: '#fff' }}>
                        Cancel
                </Button>
                </Form>
            </Modal.Content>
        </Modal>
    );



export default withRouter(graphql(getTeamMembersQuery)(DirectMessageModal));