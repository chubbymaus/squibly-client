/*

Copyright (c) 2018 Armored Online. All rights reserved.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/**
 * @class
 */

Armored = function ()
{
}

// private space

Armored.private = new Object ();

// config
// we could read this from a json file but only the debug flag changes

Armored.config = new Object ();
Armored.config.debug = true;

// asymmetric encrypt/decrypt config
Armored.config.asymmetricKeyAlgorithm = "RSA-OAEP";
Armored.config.asymmetricKeySize = 2048;

// signature config
Armored.config.signatureKeyAlgorithm = "RSASSA-PKCS1-v1_5";
Armored.config.signatureKeySize = 2048;

// symmetric config
// note we are limited to 128 bits by export limitations
// increasing to 256 will fail on foreign browsers
Armored.config.symmetricKeyAlgorithm = "AES-CBC";
Armored.config.symmetricKeySize = 128;

// we use the same hash algorithm for everything
Armored.config.hashAlgorithm = "SHA-256";

// key cache
// public keys are cached as-is
// private keys are cached serialised

Armored.channelPublicKeyCache = new Object ();
Armored.channelPrivateKeyCache = new Object ();
Armored.channelSigPublicKeyCache = new Object ();
Armored.channelSigPrivateKeyCache = new Object ();

Armored.userPublicKeyCache = new Object ();
Armored.userPrivateKeyCache = new Object ();
Armored.userSigPublicKeyCache = new Object ();
Armored.userSigPrivateKeyCache = new Object ();

// TESTERS

Armored.test = function ()
{
	Armored.testDirectMessages
	(
		function (inError)
		{
			if (inError)
			{
				console.error ("error testing direct messages");
				console.error (inError);
			}
			else
			{
				Armored.testChannelMessages
				(
					function (inError)
					{
						if (inError)
						{
							console.error ("error testing channel messages");
							console.error (inError);
						}
						else
						{
							console.log ("seems like everything worked");
						}
					}
				);
			}
		}
	);
	
}

// assumes that testDirectMessages() has been called
// in order to populate the key cache
Armored.testChannelMessages = function (inCallback)
{
	var	userOne = "jason";
	var	userTwo = "joe";
	var	userOnePassphrase = "chug";
	var	userTwoPassphrase = "pelt";
	var	channel = "random";
	var	channelPassphrase = "randomstuffs";
	
	Armored.createChannelKeys (channel, channelPassphrase).then
	(
		function (inKeys)
		{
			var	message = 
			{
				sender: userOne,
				recipient: channel,
				text: "hey this is a post to the random channel"
			};
	
			Armored.encryptChannelMessage
			(
				message,
				userOnePassphrase,
				function (inError, inEncryptedMessage)
				{
					if (inError)
					{
						inCallback (inError);
						return;
					}
					
					// now see whether a channel subscriber
					// who is neither sender nor recipient
					// can read the post
					Armored.decryptChannelMessage
					(
						inEncryptedMessage,
						channelPassphrase,
						function (inError, inMessage)
						{
							if (inError)
							{
								inCallback (inError);
							}
							else
							{
								console.log ("decrypted channel message OK");
								console.log (inMessage.text);
							
								inCallback ();
							}
						}
					);
				}
			);
		}
	)
	.catch (inCallback);
}

Armored.testDirectMessages = function (inCallback)
{
	var	userOne = "jason";
	var	userTwo = "joe";
	var	passphraseOne = "chug";
	var	passphraseTwo = "pelt";
	
	Armored.createUserKeys (userOne, passphraseOne).then
	(
		function (inUserOneKeys)
		{
			Armored.createUserKeys (userTwo, passphraseTwo).then
			(
				function (inUserTwoKeys)
				{
					var	message = 
					{
						sender: userOne,
						recipient: userTwo,
						text: "hey, this is the message text"
					};
			
					Armored.encryptDirectMessage (message, passphraseOne).then
					(
						function (inEncryptedMessage)
						{
							console.log (inEncryptedMessage);
					
							Armored.decryptDirectMessage (inEncryptedMessage, passphraseTwo).then
							(
								function (inMessage)
								{
									console.log ("decrypted direct message ok");
									console.log (inMessage.text);
								
									var	reply = 
									{
										sender: userTwo,
										recipient: userOne,
										text: "hey, this is the reply to the message text"
									};

									// now let's go the other way
									Armored.encryptDirectMessage (reply, passphraseTwo).then
									(
										function (inEncryptedReply)
										{
											Armored.decryptDirectMessage (inEncryptedReply, passphraseOne).then
											(
												function (inReply)
												{
													console.log ("decrypted reply to direct message ok");
													console.log (inReply.text);
													
													inCallback ();
												}
											)
											.catch (inCallback);
										}
									)
									.catch (inCallback);
								}		
							)
							.catch (inCallback);
						}		
					)
					.catch (inCallback);
				}
			)
			.catch (inCallback);
		}
	)
	.catch (inCallback);
}

// PUBLIC API

/**
 * Create RSA key pairs for the specified channel.
 * The callback function is optional. If not provided, a Promise is returned.
 *
 * @param {string} inChannelName - unique channel name
 * @param {string} inPassphrase - passphrase to encrypt private keys
 * @param {Armored~createChannelKeysCallback=} inCallback
 */

Armored.createChannelKeys = function (inChannelName, inPassphrase, inCallback)
{
	if (inCallback)
	{
		Armored.private.createChannelKeys (inChannelName, inPassphrase, inCallback);
	}
	else
	{
		return new Promise
		(
			function (inResolveCallback, inRejectCallback)
			{
				Armored.private.createChannelKeys
				(
					inChannelName,
					inPassphrase,
					function (inError, inKeys)
					{
						if (inError)
						{
							inRejectCallback (inError);
						}
						else
						{
							inResolveCallback (inKeys);
						}
					}
				);
			}
		);
	}
}

/**
 * Callback or Promise parameters for createChannelKeys()
 * @callback Armored~createChannelKeysCallback=
 * @param {error} error - any error that occurred
 * @param {object} keys - key structure
 * @param {object} keys.publicKey - channel public key
 * @param {string} keys.publicKeyBase64 - channel public key (X509 + Base64)
 * @param {string} keys.encryptedPrivateKey - channel private key (PKCS8 + PBE)
 * @param {string} keys.encryptedPrivateKeyBase64 - channel private key (PKCS8 + PBE + Base64)
 * @param {object} keys.sigPublicKey - channel public key
 * @param {string} keys.sigPublicKeyBase64 - channel public key (X509 + Base64)
 * @param {string} keys.encryptedSigPrivateKey - channel private key (PKCS8 + PBE)
 * @param {string} keys.encryptedSigPrivateKeyBase64 - channel private key (PKCS8 + PBE + Base64)
 * @param {string} keys.checkSigned - check sign plaintext (Base64)
 * @param {string} keys.checkSignature - check sign signature (Base64)
 */

/**
 * Create RSA key pairs for the specified user.
 * The callback function is optional. If not provided, a Promise is returned.
 *
 * @param {string} inUserName - unique user name
 * @param {string} inPassphrase - passphrase to encrypt private keys
 * @param {Armored~createUserKeysCallback=} inCallback
 */

Armored.createUserKeys = function (inChannelName, inPassphrase, inCallback)
{
	if (inCallback)
	{
		Armored.private.createUserKeys (inChannelName, inPassphrase, inCallback);
	}
	else
	{
		return new Promise
		(
			function (inResolveCallback, inRejectCallback)
			{
				Armored.private.createUserKeys
				(
					inChannelName,
					inPassphrase,
					function (inError, inKeys)
					{
						if (inError)
						{
							inRejectCallback (inError);
						}
						else
						{
							inResolveCallback (inKeys);
						}
					}
				);
			}
		);
	}
}

/**
 * Callback or Promise parameters for createUserKeys()
 * @callback Armored~createUserKeysCallback=
 * @param {error} error - any error that occurred
 * @param {object} keys - key structure
 * @param {object} keys.publicKey - user public key
 * @param {string} keys.publicKeyBase64 - user public key (X509 + Base64)
 * @param {string} keys.encryptedPrivateKey - user private key (PKCS8 + PBE)
 * @param {string} keys.encryptedPrivateKeyBase64 - user private key (PKCS8 + PBE + Base64)
 * @param {object} keys.sigPublicKey - user signature public key
 * @param {string} keys.sigPublicKeyBase64 - channel signature public key (X509 + Base64)
 * @param {string} keys.encryptedSigPrivateKey - channel signature private key (PKCS8 + PBE)
 * @param {string} keys.encryptedSigPrivateKeyBase64 - channel signature private key (PKCS8 + PBE + Base64)
 * @param {string} keys.checkSigned - check sign plaintext (Base64)
 * @param {string} keys.checkSignature - check sign signature (Base64)
 */

/**
 * Decrypt encrypted message sent from user to channel.
 * The callback function is optional. If not provided, a Promise is returned.
 *
 * @param {object} inEncryptedMessage - message to decrypt
 * @param {string} inEncryptedMessage.sender - unique user name of sender
 * @param {string} inEncryptedMessage.recipient - unique channel name of recipient
 * @param {string} inEncryptedMessage.text - ciphertext of message (base64)
 * @param {string} inEncryptedMessage.sessionkey - symmetric session key (base64)
 * @param {string} inEncryptedMessage.signature - plaintext signature (base64)
 * @param {string} inPassphrase - passphrase to decrypt private key
 * @param {Armored~decryptChannelMessageCallback=} inCallback
 */

Armored.decryptChannelMessage = function (inEncryptedMessage, inPassphrase, inCallback)
{
	if (inCallback)
	{
		Armored.private.decryptChannelMessage (inEncryptedMessage, inPassphrase, inCallback);
	}
	else
	{
		return new Promise
		(
			function (inResolveCallback, inRejectCallback)
			{
				Armored.private.decryptChannelMessage
				(
					inEncryptedMessage,
					inPassphrase,
					function (inError, inMessage)
					{
						if (inError)
						{
							inRejectCallback (inError);
						}
						else
						{
							inResolveCallback (inMessage);
						}
					}
				);
			}
		);
	}
}

/**
 * Callback or Promise parameters for decryptChannelMessage()
 * @callback Armored~decryptChannelMessageCallback
 * @param {error} error - any error that occurred
 * @param {object} message - message object
 * @param {string} message.sender - unique user name of sender
 * @param {object} message.recipient - unique channel name of recipient
 * @param {string} message.text - plaintext of message
 */

/**
 * Decrypt encrypted message sent from user to user.
 * The callback function is optional. If not provided, a Promise is returned.
 *
 * @param {object} inEncryptedMessage - message to decrypt
 * @param {string} inEncryptedMessage.sender - unique user name of sender
 * @param {string} inEncryptedMessage.recipient - unique user name of recipient
 * @param {string} inEncryptedMessage.text - ciphertext of message (base64)
 * @param {string} inEncryptedMessage.sessionkey - symmetric session key (base64)
 * @param {string} inEncryptedMessage.signature - plaintext signature (base64)
 * @param {string} inPassphrase - passphrase to decrypt private key
 * @param {Armored~decryptDirectMessageCallback=} inCallback
 */

Armored.decryptDirectMessage = function (inEncryptedMessage, inPassphrase, inCallback)
{
	if (inCallback)
	{
		Armored.private.decryptDirectMessage (inEncryptedMessage, inPassphrase, inCallback);
	}
	else
	{
		return new Promise
		(
			function (inResolveCallback, inRejectCallback)
			{
				Armored.private.decryptDirectMessage
				(
					inEncryptedMessage,
					inPassphrase,
					function (inError, inMessage)
					{
						if (inError)
						{
							inRejectCallback (inError);
						}
						else
						{
							inResolveCallback (inMessage);
						}
					}
				);
			}
		);
	}
}

/**
 * Callback or Promise parameters for decryptDirectMessage()
 * @callback Armored~decryptDirectMessageCallback
 * @param {error} error - any error that occurred
 * @param {object} message - message object
 * @param {string} message.sender - unique user name of sender
 * @param {object} message.recipient - unique user name of recipient
 * @param {string} message.text - plaintext of message
 */


/**
 * Encrypt message sent from user to channel.
 * The callback function is optional. If not provided, a Promise is returned.
 *
 * @param {object} inMessage - message to encrypt
 * @param {string} inMessage.sender - unique user name of sender
 * @param {string} inMessage.recipient - unique channel name of recipient
 * @param {string} inMessage.text - plaintext of message
 * @param {string} inPassphrase - passphrase to decrypt signature private key
 * @param {Armored~encryptChannelMessageCallback=} inCallback
 */

Armored.encryptChannelMessage = function (inMessage, inPassphrase, inCallback)
{
	if (inCallback)
	{
		Armored.private.encryptChannelMessage (inMessage, inPassphrase, inCallback);
	}
	else
	{
		return new Promise
		(
			function (inResolveCallback, inRejectCallback)
			{
				Armored.private.encryptChannelMessage
				(
					inMessage,
					inPassphrase,
					function (inError, inMessage)
					{
						if (inError)
						{
							inRejectCallback (inError);
						}
						else
						{
							inResolveCallback (inMessage);
						}
					}
				);
			}
		);
	}
}

/**
 * Callback or Promise parameters for encryptChannelMessage()
 * @callback Armored~encryptChannelMessageCallback
 * @param {error} error - any error that occurred
 * @param {object} message - message object
 * @param {string} message.sender - unique user name of sender
 * @param {object} message.recipient - unique channel name of recipient
 * @param {string} message.text - ciphertext of message (text + AES + Base64)
 * @param {string} message.sessionkey - session key (AES + PBE + Base64)
 * @param {string} message.signature - plaintext signature (Base64)
 * @param {string} message.checksign - check sign plaintext (Base64)
 * @param {string} message.checksignature - check sign signature plaintext (Base64)
 */

/**
 * Encrypt message sent from user to user.
 * The callback function is optional. If not provided, a Promise is returned.
 *
 * @param {object} inMessage - message to encrypt
 * @param {string} inMessage.sender - unique user name of sender
 * @param {string} inMessage.recipient - unique user name of recipient
 * @param {string} inMessage.text - plaintext of message
 * @param {string} inPassphrase - passphrase to decrypt signature private key
 * @param {Armored~encryptDirectMessageCallback=} inCallback
 */

Armored.encryptDirectMessage = function (inMessage, inPassphrase, inCallback)
{
	if (inCallback)
	{
		Armored.private.encryptDirectMessage (inMessage, inPassphrase, inCallback);
	}
	else
	{
		return new Promise
		(
			function (inResolveCallback, inRejectCallback)
			{
				Armored.private.encryptDirectMessage
				(
					inMessage,
					inPassphrase,
					function (inError, inMessage)
					{
						if (inError)
						{
							inRejectCallback (inError);
						}
						else
						{
							inResolveCallback (inMessage);
						}
					}
				);
			}
		);
	}
}

/**
 * Callback or Promise parameters for encryptDirectMessage()
 * @callback Armored~encryptDirectMessageCallback
 * @param {error} error - any error that occurred
 * @param {object} message - message object
 * @param {string} message.sender - unique user name of sender
 * @param {object} message.recipient - unique user name of recipient
 * @param {string} message.text - ciphertext of message (text + AES + Base64)
 * @param {string} message.sessionkey - session key (AES + PBE + Base64)
 * @param {string} message.signature - plaintext signature (Base64)
 * @param {string} message.checksign - check sign plaintext (Base64)
 * @param {string} message.checksignature - check sign signature plaintext (Base64)
 */

// PRIVATE METHODS

Armored.private.createChannelKeys = function (inChannelName, inPassphrase, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.createChannelKeys(" + inChannelName + ")");

	Armored.private.createKeyPairs
	(
		inPassphrase,
		function (inError, inKeys)
		{
			if (inError)
			{
				inCallback (inError);
				return;
			}
			
			// we hold public keys as-is
			// and private keys as serialised encrypted

			Armored.channelPublicKeyCache [inChannelName] = inKeys.publicKey;
			Armored.channelPrivateKeyCache [inChannelName] = inKeys.encryptedPrivateKey;
			Armored.channelSigPublicKeyCache [inChannelName] = inKeys.sigPublicKey;
			Armored.channelSigPrivateKeyCache [inChannelName] = inKeys.encryptedSigPrivateKey;

			// note the createKeyPairs() call makes us Base64 versions for persistence too
			
			var	keys = 
			{
				publicKey: inKeys.publicKey,
				publicKeyBase64: inKeys.publicKeyBase64,
				privateKey: inKeys.encryptedPrivateKey,
				privateKeyBase64: inKeys.encryptedPrivateKeyBase64,
				
				sigPublicKey: inKeys.sigPublicKey,
				sigPublicKeyBase64: inKeys.sigPublicKeyBase64,
				sigPrivateKey: inKeys.encryptedSigPrivateKey,
				sigPrivateKeyBase64: inKeys.encryptedSigPrivateKeyBase64,
				
				checkSigned: inKeys.checkSignedBase64,
				checkSignature: inKeys.checkSignatureBase64
			};

			// check our persistence by making the cache from the callback structure
			
			var	serialisedPublicKey = Armored.Base64.decodeToArrayBuffer (inKeys.publicKeyBase64);
			var	serialisedPrivateKey = Armored.Base64.decodeToArrayBuffer (inKeys.encryptedPrivateKeyBase64);
			var	serialisedSigPublicKey = Armored.Base64.decodeToArrayBuffer (inKeys.sigPublicKeyBase64);
			var	serialisedSigPrivateKey = Armored.Base64.decodeToArrayBuffer (inKeys.encryptedSigPrivateKeyBase64);

			Armored.private.deserialisePublicKey
			(
				serialisedPublicKey,
				"encrypt",
				function (inError, inPublicKey)
				{
					Armored.userPublicKeyCache [inChannelName] = inPublicKey;
					Armored.userPrivateKeyCache [inChannelName] = serialisedPrivateKey;
					
					Armored.private.deserialisePublicKey
					(
						serialisedSigPublicKey,
						"verify",
						function (inError, inSigPublicKey)
						{
							Armored.userSigPublicKeyCache [inChannelName] = inSigPublicKey;
							Armored.userSigPrivateKeyCache [inChannelName] = serialisedSigPrivateKey;
							
							inCallback (null, keys);
						}
					);
				}
			);
		}
	);
};

Armored.private.createKeyPairs = function (inPassphrase, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.createKeyPairs()");

	Armored.private.dispatchEvent ("armored-create-keys-progress", "generating-key");
	
	Armored.private.generateKeyPairs
	(
		function (inError, inKeyPair, inSignatureKeyPair)
		{
			if (inError)
			{
				console.error ("error generating key pairs");
				console.error (inError);
				Armored.private.dispatchEvent ("armored-create-keys-progress", "error", inError);
				inCallback (inError);
				return;
			}

			Armored.private.dispatchEvent ("armored-create-keys-progress", "serialising-keys");

			Armored.private.serialisePublicKey
			(
				inKeyPair.publicKey,
				function (inError, inPublicKeyBuffer)
				{
					if (inError)
					{
						console.error ("error serialising public key");
						console.error (inError);
						Armored.private.dispatchEvent ("armored-create-keys-progress", "error", inError);
						inCallback (inError);
						return;
					}

					Armored.private.serialisePrivateKey
					(
						inKeyPair.privateKey,
						inPassphrase,
						function (inError, inEncryptedPrivateKeyBuffer)
						{
							if (inError)
							{
								console.error ("error serialising private key");
								console.error (inError);
								Armored.private.dispatchEvent ("armored-create-keys-progress", "error", inError);
								inCallback (inError);
								return;
							}

							Armored.private.serialisePublicKey
							(
								inSignatureKeyPair.publicKey,
								function (inError, inSigPublicKeyBuffer)
								{
									if (inError)
									{
										console.error ("error serialising signature public key");
										console.error (inError);
										Armored.private.dispatchEvent ("armored-create-keys-progress", "error", inError);
										inCallback (inError);
										return;
									}

									Armored.private.serialisePrivateKey
									(
										inSignatureKeyPair.privateKey,
										inPassphrase,
										function (inError, inEncryptedSigPrivateKeyBuffer)
										{
											if (inError)
											{
												console.error ("error serialising signature private key");
												console.error (inError);
												Armored.private.dispatchEvent ("armored-create-keys-progress", "error", inError);
												inCallback (inError);
												return;
											}

											// generate something random to be signed
											var	checkSignedBuffer = new ArrayBuffer (16);
											var	checkSigned = new Uint8Array (checkSignedBuffer);
	
											for (var i = 0; i < checkSigned.byteLength; i++)
											{
												checkSigned [i] = Math.floor (Math.random () * 256);
											}
	
											Armored.private.dispatchEvent ("armored-create-keys-progress", "check-signing");

											Armored.private.sign
											(
												checkSignedBuffer,
												inSignatureKeyPair.privateKey,
												function (inError, inCheckSignatureBuffer)
												{
													if (inError)
													{
														console.error ("error check signing");
														console.error (inError);
														Armored.private.dispatchEvent ("armored-create-keys-progress", "error", inError);
														inCallback (inError);
														return;
													}

													Armored.private.dispatchEvent ("armored-create-keys-progress", "check-verifying");

													Armored.private.verify
													(
														checkSignedBuffer,
														inCheckSignatureBuffer,
														inSignatureKeyPair.publicKey,
														function (inError)
														{
															if (inError)
															{
																console.error ("error verifying check signature");
																console.error (inError);
																Armored.private.dispatchEvent ("armored-create-keys-progress", "error", inError);
																inCallback (inError);
																return;
															}
															
															// base64 everything as the first thing clients will do is serialise
															var	publicKeyBase64 = Armored.Base64.encodeArrayBuffer (inPublicKeyBuffer);
															var	encryptedPrivateKeyBase64 = Armored.Base64.encodeArrayBuffer (inEncryptedPrivateKeyBuffer);

															var	sigPublicKeyBase64 = Armored.Base64.encodeArrayBuffer (inSigPublicKeyBuffer);
															var	encryptedSigPrivateKeyBase64 = Armored.Base64.encodeArrayBuffer (inEncryptedSigPrivateKeyBuffer);

															var	checkSignedBase64 = Armored.Base64.encodeArrayBuffer (checkSignedBuffer);
															var	checkSignatureBase64 = Armored.Base64.encodeArrayBuffer (inCheckSignatureBuffer);
															
															var keys =
															{
																publicKey: inKeyPair.publicKey,
																publicKeyBase64: publicKeyBase64,
																encryptedPrivateKey: inEncryptedPrivateKeyBuffer,
																encryptedPrivateKeyBase64: encryptedPrivateKeyBase64,

																sigPublicKey: inSignatureKeyPair.publicKey,
																sigPublicKeyBase64: sigPublicKeyBase64,
																encryptedSigPrivateKey: inEncryptedSigPrivateKeyBuffer,
																encryptedSigPrivateKeyBase64: encryptedSigPrivateKeyBase64,

																checkSigned: checkSignedBuffer,
																checkSignedBase64: checkSignedBase64,
																checkSignature: inCheckSignatureBuffer,
																checkSignatureBase64: checkSignatureBase64
															};
															
															inCallback (null, keys);
														}
													);
												}
											);
										}
									);
								}
							);
						}
					);
				}
			);
		}
	);
}

Armored.private.createUserKeys = function (inUserName, inPassphrase, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.createUserKeys(" + inUserName + ")");

	Armored.private.createKeyPairs
	(
		inPassphrase,
		function (inError, inKeys)
		{
			if (inError)
			{
				inCallback (inError);
				return;
			}
			
			// Armored.userPublicKeyCache [inUserName] = inKeys.publicKey;
			// Armored.userPrivateKeyCache [inUserName] = inKeys.encryptedPrivateKey;
			// Armored.userSigPublicKeyCache [inUserName] = inKeys.sigPublicKey;
			// Armored.userSigPrivateKeyCache [inUserName] = inKeys.encryptedSigPrivateKey;

			// note the createKeyPairs() call makes us Base64 versions for persistence too
			
			var	keys = 
			{
				publicKey: inKeys.publicKey,
				publicKeyBase64: inKeys.publicKeyBase64,
				privateKey: inKeys.encryptedPrivateKey,
				privateKeyBase64: inKeys.encryptedPrivateKeyBase64,
				
				sigPublicKey: inKeys.sigPublicKey,
				sigPublicKeyBase64: inKeys.sigPublicKeyBase64,
				sigPrivateKey: inKeys.encryptedSigPrivateKey,
				sigPrivateKeyBase64: inKeys.encryptedSigPrivateKeyBase64,
				
				checkSigned: inKeys.checkSignedBase64,
				checkSignature: inKeys.checkSignatureBase64
			};

			// check our persistence by making the cache from the callback structure
			
			var	serialisedPublicKey = Armored.Base64.decodeToArrayBuffer (inKeys.publicKeyBase64);
			var	serialisedPrivateKey = Armored.Base64.decodeToArrayBuffer (inKeys.encryptedPrivateKeyBase64);
			var	serialisedSigPublicKey = Armored.Base64.decodeToArrayBuffer (inKeys.sigPublicKeyBase64);
			var	serialisedSigPrivateKey = Armored.Base64.decodeToArrayBuffer (inKeys.encryptedSigPrivateKeyBase64);

			Armored.private.deserialisePublicKey
			(
				serialisedPublicKey,
				"encrypt",
				function (inError, inPublicKey)
				{
					Armored.userPublicKeyCache [inUserName] = inPublicKey;
					Armored.userPrivateKeyCache [inUserName] = serialisedPrivateKey;
					
					Armored.private.deserialisePublicKey
					(
						serialisedSigPublicKey,
						"verify",
						function (inError, inSigPublicKey)
						{
							Armored.userSigPublicKeyCache [inUserName] = inSigPublicKey;
							Armored.userSigPrivateKeyCache [inUserName] = serialisedSigPrivateKey;
							
							inCallback (null, keys);
						}
					);
				}
			);
		}
	);
};

Armored.private.debugChecksum = function (inTitle, inArray)
{
	var	view = new Uint8Array (inArray);
	
	console.log (inTitle + " of length " + view.byteLength);
	
	var	checksum = 0;
	
	for (var i = 0; i < view.byteLength; i++)
	{
		if (i < 4)
		{
			// console.log ("entry " + i + " = " + view [i]);
		}

		checksum += view [i];
	}
	
	console.log ("checksum is " + checksum);
}

Armored.private.decryptAsymmetric = function (inKey, inCipherText, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.decryptAsymmetric()");
	
	crypto.subtle.decrypt
	(
		{
			name: Armored.config.asymmetricKeyAlgorithm,
			hash:
			{
				name: Armored.config.hashAlgorithm
			}
		},
		inKey,
		inCipherText
	).then
	(
		function (inPlainText)
		{
			inCallback (null, inPlainText);
		}
	).catch (inCallback);
};

Armored.private.decryptChannelMessage = function (inEncryptedMessage, inPassphrase, inCallback)
{
	if (Armored.config.debug)
		console.log ("Armored.private.decryptChannelMessage(" + inEncryptedMessage.sender + "," + inEncryptedMessage.recipient + ")");

	Armored.private.dispatchEvent ("armored-decrypt-message-progress", "getting-keys");

	Armored.private.getChannelPrivateKey
	(
		inEncryptedMessage.recipient,
		inPassphrase,
		function (inError, inRecipientPrivateKey)
		{
			if (inError)
			{
				console.error ("error getting private key");
				Armored.private.dispatchEvent ("armored-decrypt-message-progress", "error", inError);
				inCallback (inError);
				return;
			}

			Armored.private.getUserSigPublicKey
			(
				inEncryptedMessage.sender,
				function (inError, inSenderSigPublicKey)
				{
					if (inError)
					{
						console.error ("error getting signature public key");
						Armored.private.dispatchEvent ("armored-decrypt-message-progress", "error", inError);
						inCallback (inError);
						return;
					}
				
					Armored.private.decryptMessage
					(
						inEncryptedMessage,
						inRecipientPrivateKey,
						inSenderSigPublicKey,
						inCallback
					);
				}
			);
		}
	);
}

Armored.private.decryptMessage =
function (inEncryptedMessage, inRecipientPrivateKey, inSenderSigPublicKey, inCallback)
{
	if (Armored.config.debug)
		console.log ("Armored.private.decryptMessage(" + inEncryptedMessage.sender + "," + inEncryptedMessage.recipient + ")");
	
	var	sessionKeyBuffer = Armored.Base64.decodeToArrayBuffer (inEncryptedMessage.sessionkey);

	// note we leave these as TypedArrays as we can't convert them to ArrayBuffers without copying
	var	ivPlusEncryptedText = Armored.Base64.decodeToUInt8Array (inEncryptedMessage.text);
	var	iv = new Uint8Array (ivPlusEncryptedText.buffer, 0, 16);
	var	encryptedText = new Uint8Array (ivPlusEncryptedText.buffer, 16);

	Armored.private.dispatchEvent ("armored-decrypt-message-progress", "decrypting-message");

	Armored.private.decryptAsymmetric
	(
		inRecipientPrivateKey,
		sessionKeyBuffer,
		function (inError, inSerialisedSessionKeyBuffer)
		{
			if (inError)
			{
				console.error ("error decrypting session key");
				Armored.private.dispatchEvent ("armored-decrypt-message-progress", "error", inError);
				inCallback (inError);
				return;
			}

			Armored.private.deserialiseSymmetricKey
			(
				inSerialisedSessionKeyBuffer,
				function (inError, inSessionKeyBuffer)
				{
					if (inError)
					{
						console.error ("error deserialising session key");
						Armored.private.dispatchEvent ("armored-decrypt-message-progress", "error", inError);
						inCallback (inError);
						return;
					}
					
					Armored.private.decryptSymmetric
					(
						inSessionKeyBuffer,
						iv,
						encryptedText,
						function (inError, inTextBuffer)
						{
							if (inError)
							{
								console.error ("error decrypting text");
								Armored.private.dispatchEvent ("armored-decrypt-message-progress", "error", inError);
								inCallback (inError);
								return;
							}

							Armored.private.dispatchEvent ("armored-decrypt-message-progress", "verifying-signature");

							var	signatureBuffer = Armored.Base64.decodeToArrayBuffer (inEncryptedMessage.signature);
							
							Armored.private.verify
							(
								inTextBuffer,
								signatureBuffer,
								inSenderSigPublicKey,
								function (inError)
								{
									if (inError)
									{
										console.error ("error verifying signature");
										Armored.private.dispatchEvent ("armored-decrypt-message-progress", "error", inError);
										inCallback (inError);
									}
									else
									{
										var	message = new Object ();
										message.recipient = inEncryptedMessage.recipient;
										message.sender = inEncryptedMessage.sender;
										message.size = inEncryptedMessage.size;
										message.text = Armored.String.arrayBufferToString (inTextBuffer);

										message.attachments = new Array ();
										
										if (inEncryptedMessage.attachments)
										{
											for (var i = 0; i < inEncryptedMessage.attachments.length; i++)
											{
												var	encryptedAttachment = inEncryptedMessage.attachments [i];
												
												var	attachment = new Object ();
												attachment.name = encryptedAttachment.name;
												attachment.contentType = encryptedAttachment.contentType;
												attachment.size = encryptedAttachment.size;
												
												message.attachments.push (attachment);
											}
										}
										
										inCallback (null, message);
									}
								}
							);
						}
					);
				}
			);
		}
	);
}

Armored.private.decryptDirectMessage = function (inEncryptedMessage, inPassphrase, inCallback)
{
	if (Armored.config.debug)
		console.log ("Armored.private.decryptDirectMessage(" + inEncryptedMessage.sender + "," + inEncryptedMessage.recipient + ")");

	Armored.private.dispatchEvent ("armored-decrypt-message-progress", "getting-keys");

	Armored.private.getUserPrivateKey
	(
		inEncryptedMessage.recipient,
		inPassphrase,
		function (inError, inRecipientPrivateKey)
		{
			if (inError)
			{
				console.error ("error getting private key");
				Armored.private.dispatchEvent ("armored-decrypt-message-progress", "error", inError);
				inCallback (inError);
				return;
			}

			Armored.private.getUserSigPublicKey
			(
				inEncryptedMessage.sender,
				function (inError, inSenderSigPublicKey)
				{
					if (inError)
					{
						console.error ("error getting signature public key");
						Armored.private.dispatchEvent ("armored-decrypt-message-progress", "error", inError);
						inCallback (inError);
						return;
					}
				
					Armored.private.decryptMessage
					(
						inEncryptedMessage,
						inRecipientPrivateKey,
						inSenderSigPublicKey,
						inCallback
					);
				}
			);
		}
	);
}

// note the IV and ciphertext are TypedArrays
Armored.private.decryptSymmetric = function (inKey, inIV, inCipherText, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.decryptSymmetric()");

	crypto.subtle.decrypt
	(
		{
			name: Armored.config.symmetricKeyAlgorithm,
			iv: inIV
		},
		inKey,
		inCipherText
	).then
	(
		function (inPlainText)
		{
			inCallback (null, inPlainText);
		}
	).catch (inCallback);
}

// note the key format is...
// 16 bytes of salt
// 16 bytes of IV
// then the remaining bytes are AES128 encrypted PKCS8
// the salt is used to digest the passphrase
// the IV is used to init the AES128 decryption
Armored.private.deserialisePrivateKey = function (inSerialisedKeyBuffer, inPassphrase, inUsage, inCallback)
{
	// if (Armored.config.debug) console.log ("Armored.private.deserialisePrivateKey(" + inUsage + ")");

	var	salt = new Uint8Array (inSerialisedKeyBuffer, 0, 16);
	var	iv = new Uint8Array (inSerialisedKeyBuffer, 16, 16);
	var	pkcs8Key = new Uint8Array (inSerialisedKeyBuffer, 32);

	var	passphrase = Armored.String.stringToUInt8Array (inPassphrase);
	
	var	saltPlusPassphrase = new Uint8Array (salt.byteLength + passphrase.byteLength);

	for (var i = 0; i < saltPlusPassphrase.byteLength; i++)
	{
		if (i < salt.byteLength)
		{
			saltPlusPassphrase [i] = salt [i];
		}
		else
		{
			saltPlusPassphrase [i] = passphrase [i - salt.byteLength];
		}
	}
	
	// it's funny, Armoured actually does 1001 iterations
	// 1 + 1000 more as PKCS5 suggests

	Armored.private.digest
	(
		saltPlusPassphrase,
		1001,
		function (inDigest)
		{
			var	passphraseDigest = inDigest;

			// these all check out compared to the java version, btw
			// gApplication.debugChecksum ("pkcs key", pkcs8Key);
			// gApplication.debugChecksum ("aes key", passphraseDigest);
			// gApplication.debugChecksum ("iv", iv);
			
			// we now have a 256bit AES key
			// HOWEVER but we can only use 128 bits of it
			// thanks to export restrictions
			var	aesKey = new Uint8Array (passphraseDigest, 0, 16);

			// browsers only need unwrapKey here
			// but node-webcrypto needs decrypt as well
			crypto.subtle.importKey
			(
				"raw",
				aesKey,
				{
					name: Armored.config.symmetricKeyAlgorithm,
					length: aesKey.byteLength
				},
				true,
				[
					"unwrapKey",
					"decrypt"
				]
			).then
			(
				function (inAESKey)
				{
					var	algorithm = null;
					var	hash = null;
					
					if (inUsage == "decrypt")
					{
						algorithm = Armored.config.asymmetricKeyAlgorithm;
						hash = Armored.config.hashAlgorithm;
					}
					else
					if (inUsage == "sign")
					{
						algorithm = Armored.config.signatureKeyAlgorithm;
						hash = Armored.config.hashAlgorithm;
					}
					else
					{
						throw new Error ("invalid usage " + inUsage);
					}

					crypto.subtle.unwrapKey
					(
						"pkcs8",
						pkcs8Key,
						inAESKey,
						{
							name: Armored.config.symmetricKeyAlgorithm,
							iv: iv
						},
						{
							name: algorithm,
							hash:
							{
								name: hash
							}
						},
						true,
						[
							inUsage
						]
					).then
					(
						function (inUnwrappedKey)
						{
							inCallback (null, inUnwrappedKey);
						}
					).catch (inCallback);
				}
			).catch (inCallback);
		}
	);
}

Armored.private.deserialisePublicKey = function (inSerialisedKeyBuffer, inUsage, inCallback)
{
	// if (Armored.config.debug) console.log ("Armored.private.deserialisePublicKey(" + inUsage + ")");
	
	var	algorithm = null;
	var	hash = null;
	
	if (inUsage == "encrypt")
	{
		algorithm = Armored.config.asymmetricKeyAlgorithm;
		hash = Armored.config.hashAlgorithm;
	}
	else
	if (inUsage == "verify")
	{
		algorithm = Armored.config.signatureKeyAlgorithm;
		hash = Armored.config.hashAlgorithm;
	}
	else
	{
		throw new Error ("invalid usage " + inUsage);
	}

	crypto.subtle.importKey
	(
		"spki",
		inSerialisedKeyBuffer,
		{
			name: algorithm,
			hash: 
			{
				name: hash
			}
		},
		true,
		[
			inUsage
		]
	).then
	(
		function (inKey)
		{
			inCallback (null, inKey);
		}
	).catch (inCallback);
}

Armored.private.deserialiseSymmetricKey = function (inSerialisedKeyBuffer, inCallback)
{
	// if (Armored.config.debug) console.log ("Armored.private.deserialiseSymmetricKey()");

	crypto.subtle.importKey
	(
		"raw",
		inSerialisedKeyBuffer,
		{
			name: Armored.config.symmetricKeyAlgorithm,
			length: inSerialisedKeyBuffer.byteLength
		},
		true,
		[
			"decrypt"
		]
	).then
	(
		function (inKey)
		{
			inCallback (null, inKey);
		}
	).catch (inCallback);
}

Armored.private.digest = function (inToDigest, inIterations, inCallback)
{
	var	digest = inToDigest;
	
	var	iterations = new Array ();
	
	for (var i = 0; i < inIterations; i++)
	{
		iterations.push (i);
	}

	new Armored.List.asyncListHelper
	({
		list: iterations,
		iterate: function (inHelper, inItem)
		{
			crypto.subtle.digest
			(
				{
					name: Armored.config.hashAlgorithm
				},
				digest
			).then
			(
				function (inDigest)
				{
					digest = inDigest;
					inHelper.onIteration ();
				}
			).catch (inCallback);
		},
		complete: function ()
		{
			inCallback (digest);
		}
	});
}

Armored.private.dispatchEvent = function (inType, inState, inData1, inData2)
{
	if (Armored.config.debug)
		console.log ("Armored.private.dispatchEvent(" + inType + "," + inState + ")");
	
	// caution, we might be in Node
	if (typeof window != "undefined")
	{
		var	event = document.createEvent ("Event");
		event.initEvent (inType, true, true);
		event.detail = new Object ();
		event.detail.state = inState;
		event.detail.data1 = inData1;
		event.detail.data2 = inData2;
		
		window.dispatchEvent (event);
	}
}

Armored.private.encryptAsymmetric = function (inKey, inPlainText, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.encryptAsymmetric()");

	crypto.subtle.encrypt
	(
		{
			name: Armored.config.asymmetricKeyAlgorithm,
			hash:
			{
				name: Armored.config.hashAlgorithm
			}
		},
		inKey,
		inPlainText
	).then
	(
		function (inCipherText)
		{
			inCallback (null, inCipherText);
		}
	).catch (inCallback);
};

Armored.private.encryptChannelMessage = function (inMessage, inPassphrase, inCallback)
{
	if (Armored.config.debug)
		console.log ("Armored.private.encryptChannelMessage(" + inMessage.sender + "," + inMessage.recipient + ")");

	Armored.private.dispatchEvent ("armored-encrypt-message-progress", "getting-keys");

	Armored.private.getChannelPublicKey
	(
		inMessage.recipient,
		function (inError, inRecipientPublicKey)
		{
			if (inError)
			{
				inCallback (inError);
				return;
			}
			
			Armored.private.getUserSigPrivateKey
			(
				inMessage.sender,
				inPassphrase,
				function (inError, inSenderSigPrivateKey)
				{
					if (inError)
					{
						inCallback (inError);
						return;
					}

					Armored.private.encryptMessage
					(
						inMessage,
						inRecipientPublicKey,
						inSenderSigPrivateKey,
						inCallback
					);
				}
			);
		}
	);
}

Armored.private.encryptDirectMessage = function (inMessage, inPassphrase, inCallback)
{
	if (Armored.config.debug)
		console.log ("Armored.private.encryptDirectMessage(" + inMessage.sender + "," + inMessage.recipient + ")");

	Armored.private.dispatchEvent ("armored-encrypt-message-progress", "getting-keys");

	Armored.private.getUserPublicKey
	(
		inMessage.recipient,
		function (inError, inRecipientPublicKey)
		{
			if (inError)
			{
				inCallback (inError);
				return;
			}
			
			Armored.private.getUserSigPrivateKey
			(
				inMessage.sender,
				inPassphrase,
				function (inError, inSenderSigPrivateKey)
				{
					if (inError)
					{
						inCallback (inError);
						return;
					}

					Armored.private.encryptMessage
					(
						inMessage,
						inRecipientPublicKey,
						inSenderSigPrivateKey,
						inCallback
					);
				}
			);
		}
	);
}

Armored.private.encryptMessage =
function (inMessage, inRecipientPublicKey, inSenderSigPrivateKey, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.encryptMessage()");
	
	Armored.private.dispatchEvent ("armored-encrypt-message-progress", "signing-message");

	var	textBuffer = Armored.String.stringToArrayBuffer (inMessage.text);
		
	Armored.private.sign
	(
		textBuffer,
		inSenderSigPrivateKey,
		function (inError, inSignatureBuffer)
		{
			if (inError)
			{
				inCallback (inError);
				return;
			}
			
			Armored.private.dispatchEvent ("armored-encrypt-message-progress", "generating-session-key");

			Armored.private.generateSessionKey
			(
				function (inError, inSessionKey)
				{
					if (inError)
					{
						inCallback (inError);
						return;
					}
			
					Armored.private.dispatchEvent ("armored-encrypt-message-progress", "encrypting-message");

					Armored.private.encryptSymmetric
					(
						textBuffer,
						inSessionKey,
						function (inError, inIVAndEncryptedTextBuffer)
						{
							if (inError)
							{
								inCallback (inError);
								return;
							}
					
							Armored.private.serialiseSymmetricKey
							(
								inSessionKey,
								function (inError, inSerialisedSessionKeyBuffer)
								{
									if (inError)
									{
										inCallback (inError);
										return;
									}
									
									Armored.private.dispatchEvent ("armored-encrypt-message-progress", "encrypting-session-key");

									Armored.private.encryptAsymmetric
									(
										inRecipientPublicKey,
										inSerialisedSessionKeyBuffer,
										function (inError, inEncryptedSessionKeyBuffer)
										{
											if (inError)
											{
												inCallback (inError);
												return;
											}
											
											// generate something random to be signed
											var	checkSignedBuffer = new ArrayBuffer (16);
											var	checkSigned = new Uint8Array (checkSignedBuffer);

											for (var i = 0; i < checkSigned.byteLength; i++)
											{
												checkSigned [i] = Math.floor (Math.random () * 256);
											}

											Armored.private.dispatchEvent ("armored-encrypt-message-progress", "check-signing");

											Armored.private.sign
											(
												checkSignedBuffer,
												inSenderSigPrivateKey,
												function (inError, inCheckSignatureBuffer)
												{
													if (inError)
													{
														console.error ("error signing signed thing");
														console.error (inError);
														Armored.private.dispatchEvent ("armored-encrypt-message-progress", "error", inError);
														inCallback (inError);
														return;
													}
													
													// note we don't verify on encrypt
													// as getting the required key is a cost

													// convert binaries to uint8arrays
													// var	signature = new Uint8Array (inSignatureBuffer);
													// var	ivAndEncryptedText = new Uint8Array (inIVAndEncryptedTextBuffer);
													// var	encryptedSessionKey = new Uint8Array (inEncryptedSessionKeyBuffer);
													// var	checkSignature = new Uint8Array (inCheckSignatureBuffer);

													// base64 for transmission
													var	ivAndEncryptedTextBase64 = Armored.Base64.encodeArrayBuffer (inIVAndEncryptedTextBuffer);
													var	encryptedSessionKeyBase64 = Armored.Base64.encodeArrayBuffer (inEncryptedSessionKeyBuffer);
													var	signatureBase64 = Armored.Base64.encodeArrayBuffer (inSignatureBuffer);

													var	checkSignedBase64 = Armored.Base64.encodeArrayBuffer (checkSignedBuffer);
													var	checkSignatureBase64 = Armored.Base64.encodeArrayBuffer (inCheckSignatureBuffer);

													var	encryptedMessage = 
													{
														sender: inMessage.sender,
														recipient: inMessage.recipient,
														text: ivAndEncryptedTextBase64,
														sessionkey: encryptedSessionKeyBase64,
														signature: signatureBase64,
														size: inMessage.text.length,
														checksigned: checkSignedBase64,
														checksignature: checkSignatureBase64
													};
									
													encryptedMessage.attachments = new Array ();
									
													// add skeleton attachment records
													// note, the type of attachments might be a FileList which is not an Array
													if (inMessage.attachments && (typeof inMessage.attachments.length == "number"))
													{
														for (var i = 0; i < inMessage.attachments.length; i++)
														{
															var	attachment = inMessage.attachments [i];
											
															// sigh sometimes this isn't filled in sigh
															if (attachment.type == null || attachment.type.length == 0)
															{
																console.log ("no type in attachment File record, defaulting");
																attachment.type = "application/octet-stream";
															}
											
															encryptedMessage.attachments.push
															({
																name: attachment.name,
																size: attachment.size,
																content_type: attachment.type,
																data: null,
																encrypted_size: 0,
																signature: null
															});
														}
													}
													else
													{
														// console.log ("message has null or non-array attachments");
													}
									
													encryptedMessage.attachmentcount = encryptedMessage.attachments.length;
									
													inCallback (null, encryptedMessage);
												}
											);
										}
									);
								}
							);
						}
					);
				}
			);
		}
	);
}

Armored.private.encryptSymmetric = function (inPlainText, inKey, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.encryptSymmetric()");

	var	iv = new Uint8Array (16);
	
	for (var i = 0; i < iv.byteLength; i++)
	{
		iv [i] = Math.floor (Math.random () * 256);
	}
	
	crypto.subtle.encrypt
	(
		{
			name: Armored.config.symmetricKeyAlgorithm,
			iv: iv
		},
		inKey,
		inPlainText
	).then
	(
		function (inCipherTextBuffer)
		{
			var	cipherText = new Uint8Array (inCipherTextBuffer);
			var	ivAndEncrypted = new Uint8Array (16 + cipherText.byteLength);
			
			for (var i = 0; i < ivAndEncrypted.byteLength; i++)
			{
				if (i < iv.byteLength)
				{
					ivAndEncrypted [i] = iv [i];
				}
				else
				{
					ivAndEncrypted [i] = cipherText [i - iv.byteLength];
				}
			}
			
			var	ivAndEncryptedBuffer = ivAndEncrypted.buffer;
			
			inCallback (null, ivAndEncryptedBuffer);
		}
	).catch (inCallback);
}

Armored.private.generateKeyPairs = function (inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.generateKeyPairs()");

	crypto.subtle.generateKey
	(
		{
			name: Armored.config.asymmetricKeyAlgorithm,
			modulusLength: Armored.config.asymmetricKeySize,
			publicExponent: new Uint8Array ([0x01, 0x00, 0x01]),
			hash:
			{
				name: Armored.config.hashAlgorithm
			}
		},
		true,
		[
			"decrypt",
			"encrypt"
		]
	).then
	(
		function (inKeyPair)
		{
			crypto.subtle.generateKey
			(
				{
					name: Armored.config.signatureKeyAlgorithm,
					modulusLength: Armored.config.signatureKeySize,
					publicExponent: new Uint8Array ([0x01, 0x00, 0x01]),
					hash:
					{
						name: Armored.config.hashAlgorithm
					}
				},
				true,
				[
					"sign",
					"verify"
				]
			).then
			(
				function (inSignatureKeyPair)
				{
					inCallback (null, inKeyPair, inSignatureKeyPair);
				}
			).catch (inCallback);
		}
	).catch (inCallback);
}

Armored.private.generateSessionKey = function (inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.generateSessionKey()");

	var	iv = new Uint8Array (16);
	
	for (var i = 0; i < iv.byteLength; i++)
	{
		iv [i] = Math.floor (Math.random () * 256);
	}
	
	crypto.subtle.generateKey
	(
		{
			name: Armored.config.symmetricKeyAlgorithm,
			length: Armored.config.symmetricKeySize,
			iv: iv
		},
		true,
		[
			"decrypt",
			"encrypt"
		]
	).then
	(
		function (inKey)
		{
			inCallback (null, inKey);
		}
	).catch (inCallback);
}

Armored.private.getChannelPrivateKey = function (inUserName, inPassphrase, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.getChannelPrivateKey(" + inUserName + ")");
	
	var	serialisedPrivateKey = Armored.channelPrivateKeyCache [inUserName];
	
	if (serialisedPrivateKey)
	{
		Armored.private.deserialisePrivateKey (serialisedPrivateKey, inPassphrase, "decrypt", inCallback);
	}
	else
	{
		var	url = Armored.config.url + "/"
			+ Armored.config.controller + "/"
			+ "getprivatekey?";
	
		monohm.Network.postJSONAsync
		(
			url,
			function (inError, inJSON)
			{
				if (inError)
				{
					inCallback (inError);
				}
				else
				if (inJSON.type == "error")
				{
					inCallback (new Error (inJSON.error));
				}
				else
				if (inJSON.type == "map")
				{
					serialisedPrivateKey = Armored.Base64.decodeToUInt8Array (inJSON.data.key);
					
					Armored.channelPrivateKeyCache [inUserName] = serialisedPrivateKey;
					
					Armored.private.deserialisePrivateKey (serialisedPrivateKey, inPassphrase, "decrypt", inCallback);
				}
			}
		);
	}
}

Armored.private.getChannelPublicKey = function (inUser, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.getChannelPublicKey(" + inUser + ")");
	
	var	publicKey = Armored.channelPublicKeyCache [inUser];
	
	if (publicKey)
	{
		inCallback (null, publicKey);
	}
	else
	{
		var	url = Armored.config.url + "/"
			+ Armored.config.controller + "/"
			+ "getpublickey?"
			+ "user=" + inUser;
	
		monohm.Network.postJSONAsync
		(
			url,
			function (inError, inJSON)
			{
				if (inError)
				{
					inCallback (inError);
				}
				else
				if (inJSON.type == "error")
				{
					inCallback (new Error (inJSON.error));
				}
				else
				if (inJSON.type == "map")
				{
					var	publicKeyBase64 = inJSON.data.key;
					
					if (publicKeyBase64)
					{
						var	serialisedPublicKeyBuffer = Armored.Base64.decodeToArrayBuffer (publicKeyBase64);
					
						Armored.private.deserialisePublicKey
						(
							serialisedPublicKeyBuffer,
							"encrypt",
							function (inError, inPublicKey)
							{
								if (inPublicKey)
								{
									Armored.channelPublicKeyCache [inUser] = inPublicKey;
								}
							
								inCallback (inError, inPublicKey);
							}
						);
					}
					else
					{
						inCallback (null, null);
					}
				}
			}
		);
	}
}

Armored.private.getChannelSigPrivateKey = function (inUserName, inPassphrase, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.getChannelSigPrivateKey(" + inUserName + ")");
	
	var	serialisedPrivateKey = Armored.channelSigPrivateKeyCache [inUserName];
	
	if (serialisedPrivateKey)
	{
		Armored.private.deserialisePrivateKey (serialisedPrivateKey, inPassphrase, "sign", inCallback);
	}
	else
	{
		var	url = Armored.config.url + "/"
			+ Armored.config.controller + "/"
			+ "getsigprivatekey?";
	
		monohm.Network.postJSONAsync
		(
			url,
			function (inError, inJSON)
			{
				if (inError)
				{
					inCallback (inError);
				}
				else
				if (inJSON.type == "error")
				{
					inCallback (new Error (inJSON.error));
				}
				else
				if (inJSON.type == "map")
				{
					serialisedPrivateKey = Armored.Base64.decodeToUInt8Array (inJSON.data.key);
					
					Armored.channelSigPrivateKeyCache [inUserName] = serialisedPrivateKey;
					
					Armored.private.deserialisePrivateKey (serialisedPrivateKey, inPassphrase, "sign", inCallback);
				}
			}
		);
	}
}

Armored.private.getChannelSigPublicKey = function (inUserName, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.getChannelSigPublicKey(" + inUserName + ")");
	
	var	sigPublicKey = Armored.channelSigPublicKeyCache [inUserName];
	
	if (sigPublicKey)
	{
		inCallback (null, sigPublicKey);
	}
	else
	{
		var	url = Armored.config.url + "/"
			+ Armored.config.controller + "/"
			+ "getsigpublickey?"
			+ "user=" + inUser;
	
		monohm.Network.postJSONAsync
		(
			url,
			function (inError, inJSON)
			{
				if (inError)
				{
					inCallback (inError);
				}
				else
				if (inJSON.type == "error")
				{
					inCallback (new Error (inJSON.error));
				}
				else
				if (inJSON.type == "map")
				{
					var	publicKeyBase64 = inJSON.data.key;
					
					if (publicKeyBase64)
					{
						var	serialisedPublicKeyBuffer = Armored.Base64.decodeToArrayBuffer (publicKeyBase64);
					
						Armored.private.deserialisePublicKey
						(
							serialisedPublicKeyBuffer,
							"verify",
							function (inError, inSigPublicKey)
							{
								if (inSigPublicKey)
								{
									Armored.channelSigPublicKeyCache [inUser] = inSigPublicKey;
								}
							
								inCallback (inError, inSigPublicKey);
							}
						);
					}
					else
					{
						inCallback (inError, null);
					}
				}
			}
		);
	}
}

Armored.private.getUserPrivateKey = function (inUserName, inPassphrase, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.getUserPrivateKey(" + inUserName + ")");
	
	var	serialisedPrivateKey = Armored.userPrivateKeyCache [inUserName];
	
	if (serialisedPrivateKey)
	{
		Armored.private.deserialisePrivateKey (serialisedPrivateKey, inPassphrase, "decrypt", inCallback);
	}
	else
	{
		var	url = Armored.config.url + "/"
			+ Armored.config.controller + "/"
			+ "getprivatekey?";
	
		monohm.Network.postJSONAsync
		(
			url,
			function (inError, inJSON)
			{
				if (inError)
				{
					inCallback (inError);
				}
				else
				if (inJSON.type == "error")
				{
					inCallback (new Error (inJSON.error));
				}
				else
				if (inJSON.type == "map")
				{
					serialisedPrivateKey = Armored.Base64.decodeToUInt8Array (inJSON.data.key);
					
					Armored.userPrivateKeyCache [inUserName] = serialisedPrivateKey;
					
					Armored.private.deserialisePrivateKey (serialisedPrivateKey, inPassphrase, "decrypt", inCallback);
				}
			}
		);
	}
}

Armored.private.getUserPublicKey = function (inUser, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.getUserPublicKey(" + inUser + ")");
	
	var	publicKey = Armored.userPublicKeyCache [inUser];
	
	if (publicKey)
	{
		inCallback (null, publicKey);
	}
	else
	{
		var	url = Armored.config.url + "/"
			+ Armored.config.controller + "/"
			+ "getpublickey?"
			+ "user=" + inUser;
	
		monohm.Network.postJSONAsync
		(
			url,
			function (inError, inJSON)
			{
				if (inError)
				{
					inCallback (inError);
				}
				else
				if (inJSON.type == "error")
				{
					inCallback (new Error (inJSON.error));
				}
				else
				if (inJSON.type == "map")
				{
					var	publicKeyBase64 = inJSON.data.key;
					
					if (publicKeyBase64)
					{
						var	serialisedPublicKeyBuffer = Armored.Base64.decodeToArrayBuffer (publicKeyBase64);
					
						Armored.private.deserialisePublicKey
						(
							serialisedPublicKeyBuffer,
							"encrypt",
							function (inError, inPublicKey)
							{
								if (inPublicKey)
								{
									Armored.userPublicKeyCache [inUser] = inPublicKey;
								}
							
								inCallback (inError, inPublicKey);
							}
						);
					}
					else
					{
						inCallback (null, null);
					}
				}
			}
		);
	}
}

Armored.private.getUserSigPrivateKey = function (inUserName, inPassphrase, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.getUserSigPrivateKey(" + inUserName + ")");
	
	var	serialisedPrivateKey = Armored.userSigPrivateKeyCache [inUserName];
	
	if (serialisedPrivateKey)
	{
		Armored.private.deserialisePrivateKey (serialisedPrivateKey, inPassphrase, "sign", inCallback);
	}
	else
	{
		var	url = Armored.config.url + "/"
			+ Armored.config.controller + "/"
			+ "getsigprivatekey?";
	
		monohm.Network.postJSONAsync
		(
			url,
			function (inError, inJSON)
			{
				if (inError)
				{
					inCallback (inError);
				}
				else
				if (inJSON.type == "error")
				{
					inCallback (new Error (inJSON.error));
				}
				else
				if (inJSON.type == "map")
				{
					serialisedPrivateKey = Armored.Base64.decodeToUInt8Array (inJSON.data.key);
					
					Armored.userSigPrivateKeyCache [inUserName] = serialisedPrivateKey;
					
					Armored.private.deserialisePrivateKey (serialisedPrivateKey, inPassphrase, "sign", inCallback);
				}
			}
		);
	}
}

Armored.private.getUserSigPublicKey = function (inUserName, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.getUserSigPublicKey(" + inUserName + ")");
	
	var	sigPublicKey = Armored.userSigPublicKeyCache [inUserName];
	
	if (sigPublicKey)
	{
		inCallback (null, sigPublicKey);
	}
	else
	{
		var	url = Armored.config.url + "/"
			+ Armored.config.controller + "/"
			+ "getsigpublickey?"
			+ "user=" + inUser;
	
		monohm.Network.postJSONAsync
		(
			url,
			function (inError, inJSON)
			{
				if (inError)
				{
					inCallback (inError);
				}
				else
				if (inJSON.type == "error")
				{
					inCallback (new Error (inJSON.error));
				}
				else
				if (inJSON.type == "map")
				{
					var	publicKeyBase64 = inJSON.data.key;
					
					if (publicKeyBase64)
					{
						var	serialisedPublicKeyBuffer = Armored.Base64.decodeToArrayBuffer (publicKeyBase64);
					
						Armored.private.deserialisePublicKey
						(
							serialisedPublicKeyBuffer,
							"verify",
							function (inError, inSigPublicKey)
							{
								if (inSigPublicKey)
								{
									Armored.userSigPublicKeyCache [inUser] = inSigPublicKey;
								}
							
								inCallback (inError, inSigPublicKey);
							}
						);
					}
					else
					{
						inCallback (inError, null);
					}
				}
			}
		);
	}
}

Armored.private.serialisePrivateKey = function (inPrivateKey, inPassphrase, inCallback)
{
	// if (Armored.config.debug) console.log ("Armored.private.serialisePrivateKey()");

	var	passphrase = Armored.String.stringToUInt8Array (inPassphrase);
	
	var	salt = new Uint8Array (16);
	
	for (var i = 0; i < salt.length; i++)
	{
		salt [i] = Math.floor (Math.random () * 256);
	}
	
	var	saltPlusPassphrase = new Uint8Array (salt.byteLength + passphrase.byteLength);

	for (var i = 0; i < saltPlusPassphrase.byteLength; i++)
	{
		saltPlusPassphrase [i] = salt [i];
	}
	
	for (var i = 0; i < passphrase.byteLength; i++)
	{
		saltPlusPassphrase [salt.byteLength + i] = passphrase [i];
	}
	
	// it's funny, Armoured actually does 1001 iterations
	// 1 + 1000 more as PKCS5 suggests

	// if (Armored.config.debug) console.log ("digesting passphrase");

	Armored.private.digest
	(
		saltPlusPassphrase,
		1001,
		function (inPassphraseDigest)
		{
			// if (Armored.config.debug) console.log ("importing AES key from digest");

			// caution we can only use 128 bits of the digest
			// due to export restrictions
			var	aesKey = new Uint8Array (inPassphraseDigest, 0, 16);

			crypto.subtle.importKey
			(
				"raw",
				aesKey,
				{
					name: Armored.config.symmetricKeyAlgorithm,
					length: aesKey.byteLength
				},
				true,
				[
					"encrypt",
					"wrapKey"
				]
			).then
			(
				function (inAESKey)
				{
					var	iv = new Uint8Array (16);
					
					for (var i = 0; i < iv.length; i++)
					{
						iv [i] = Math.floor (Math.random () * 256);
					}
					
					// if (Armored.config.debug) console.log ("wrapping private key with AES key");

					crypto.subtle.wrapKey
					(
						"pkcs8",
						inPrivateKey,
						inAESKey,
						{
							name: Armored.config.symmetricKeyAlgorithm,
							iv: iv
						}
					).then
					(
						function (inWrappedKeyBuffer)
						{
							var	wrappedKey = new Uint8Array (inWrappedKeyBuffer);

							var	saltPlusIVPlusKey = new Uint8Array
								(salt.byteLength + iv.byteLength + wrappedKey.byteLength);
							
							for (var i = 0; i < salt.byteLength; i++)
							{
								saltPlusIVPlusKey [i] = salt [i];
							}

							for (var i = 0; i < iv.byteLength; i++)
							{
								saltPlusIVPlusKey [salt.byteLength + i] = iv [i];
							}
							
							for (var i = 0; i < wrappedKey.byteLength; i++)
							{
								saltPlusIVPlusKey [salt.byteLength + iv.byteLength + i] = wrappedKey [i];
							}
							
							// pass this around as ArrayBuffers where possible
							var	saltPlusIVPlusKeyBuffer = saltPlusIVPlusKey.buffer;
							
							inCallback (null, saltPlusIVPlusKeyBuffer);
						}
					);
				}
			).catch (inCallback)
		}
	);
}

Armored.private.serialisePublicKey = function (inPublicKey, inCallback)
{
	// if (Armored.config.debug) console.log ("Armored.private.serialisePublicKey()");

	crypto.subtle.exportKey ("spki", inPublicKey).then
	(
		function (inPublicKeySPKI)
		{
			inCallback (null, inPublicKeySPKI);
		}
	).catch (inCallback);
}

Armored.private.serialiseSymmetricKey = function (inKey, inCallback)
{
	// if (Armored.config.debug) console.log ("Armored.private.serialiseSymmetricKey()");

	crypto.subtle.exportKey ("raw", inKey).then
	(
		function (inSerialisedKeyBuffer)
		{
			inCallback (null, inSerialisedKeyBuffer);
		}
	).catch (inCallback);
}

Armored.private.sign = function (inContent, inKey, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.sign()");

	crypto.subtle.sign
	(
		{
			name: Armored.config.signatureKeyAlgorithm,
			hash: Armored.config.hashAlgorithm
		},
		inKey,
		inContent
	).then
	(
		function (inSignature)
		{
			inCallback (null, inSignature);
		}
	).catch (inCallback);
}

Armored.private.verify = function (inSignedBuffer, inSignatureBuffer, inPublicKey, inCallback)
{
	if (Armored.config.debug) console.log ("Armored.private.verify()");

	crypto.subtle.verify
	(
		{
			name: Armored.config.signatureKeyAlgorithm,
			hash: Armored.config.hashAlgorithm
		},
		inPublicKey,
		inSignatureBuffer,
		inSignedBuffer
	).then
	(
		function (inIsValid)
		{
			if (inIsValid)
			{
				inCallback ();
			}
			else
			{
				inCallback (new Error ("signature does not verify"));
			}
		}
	).catch (inCallback);
}

// ASYNC LIST HELPER

Armored.List = new Object ();

Armored.List.asyncListHelper = function (inConfig)
{
	this.config = inConfig;
	
	if (!this.config.this)
	{
		this.config.this = this;
	}
	
	if (this.config.list && Array.isArray (this.config.list))
	{
		this.index = 0;
		this.iterate ();
	}
	else
	{
		console.error ("no list passed to AsyncListHelper");
		this.complete ();
	}
}

Armored.List.asyncListHelper.prototype.complete = function ()
{		
	if (this.config.complete)
	{
		this.config.complete.call (this.config.this);
	}
	else
	{
		console.error ("no complete function passed to AsyncListHelper");
	}
}

Armored.List.asyncListHelper.prototype.iterate = function ()
{
	if (this.index < this.config.list.length)
	{
		if (this.config.iterate)
		{
			// pass our "this" first so the client always has a reliable handle on us
			this.config.iterate.call (this.config.this, this, this.config.list [this.index]);
		}
		else
		{
			console.error ("no iterate function passed to AsyncListHelper");
			this.complete ();
		}
	}
	else
	{
		this.complete ();
	}
}

Armored.List.asyncListHelper.prototype.onIteration = function (inContinue)
{
	if (arguments.length == 0)
	{
		inContinue = true;
	}
	
	if (inContinue)
	{
		this.index++;
		this.iterate ();
	}
	else
	{
		this.complete ();
	}
}

// BASE64 SUBSYSTEM

Armored.Base64 = new Object ();

Armored.Base64.encodeArrayBuffer = function (inBuffer)
{
	var	array = null;
	
	// check someone didn't send a typed array in here
	if (typeof (inBuffer.length) == "number")
	{
		console.error ("TypedArray passed to encodeArrayBuffer()");
		console.trace ();
		array = inBuffer;
	}
	else
	{
		array = new Uint8Array (inBuffer);
	}
	
	return Armored.Base64.encodeUInt8Array (array);
}

// method stolen from Stack Overflow
// honestly ArrayBuffers are so primitive
Armored.Base64.encodeUInt8Array = function (inArray)
{
	// check someone didn't send an ArrayBuffer in here
	if (typeof (inArray.length) == "undefined")
	{
		console.error ("ArrayBuffer passed to encodeUInt8Array()");
		inArray = new Uint8Array (inArray);
	}
	
	var binaryString = "";
	var len = inArray.byteLength;

	for (var i = 0; i < len; i++)
	{
		binaryString += String.fromCharCode (inArray [i]);
	}
	
	return btoa (binaryString);
}

Armored.Base64.decodeToArrayBuffer = function (inBase64String)
{
	var	array = Armored.Base64.decodeToUInt8Array (inBase64String);
	
	return array.buffer;
}

Armored.Base64.decodeToUInt8Array = function (inBase64String)
{
	var	binaryString = atob (inBase64String);
	var len = binaryString.length;
	var	bytes = new Uint8Array (len);
	
	for (var i = 0; i < len; i++)
	{
		bytes [i] = binaryString.charCodeAt (i);
	}
	
	return bytes;
}

// STRING SUBSYSTEM

Armored.String = new Object ();

Armored.String.stringToArrayBuffer = function (inString)
{
	var	array = Armored.String.stringToUInt8Array (inString);
	return array.buffer;
}

// algorithm stolen from Mozilla's base64.js
Armored.String.stringToUInt8Array = function (inString)
{
  var aBytes, nChr, nStrLen = inString.length, nArrLen = 0;

  /* mapping... */

  for (var nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++)
  {
    nChr = inString.charCodeAt (nMapIdx);
    nArrLen += nChr < 0x80 ? 1 : nChr < 0x800 ? 2 : nChr < 0x10000 ? 3 : nChr < 0x200000 ? 4 : nChr < 0x4000000 ? 5 : 6;
  }

  aBytes = new Uint8Array(nArrLen);

  /* transcription... */

  for (var nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx++)
  {
    nChr = inString.charCodeAt(nChrIdx);
    
    if (nChr < 128)
    {
      /* one byte */
      aBytes [nIdx++] = nChr;
    }
    else if (nChr < 0x800)
    {
      /* two bytes */
      aBytes [nIdx++] = 192 + (nChr >>> 6);
      aBytes [nIdx++] = 128 + (nChr & 63);
    }
    else if (nChr < 0x10000)
    {
      /* three bytes */
      aBytes [nIdx++] = 224 + (nChr >>> 12);
      aBytes [nIdx++] = 128 + (nChr >>> 6 & 63);
      aBytes [nIdx++] = 128 + (nChr & 63);
    }
    else if (nChr < 0x200000)
    {
      /* four bytes */
      aBytes [nIdx++] = 240 + (nChr >>> 18);
      aBytes [nIdx++] = 128 + (nChr >>> 12 & 63);
      aBytes [nIdx++] = 128 + (nChr >>> 6 & 63);
      aBytes [nIdx++] = 128 + (nChr & 63);
    }
    else if (nChr < 0x4000000)
    {
      /* five bytes */
      aBytes [nIdx++] = 248 + (nChr >>> 24);
      aBytes [nIdx++] = 128 + (nChr >>> 18 & 63);
      aBytes [nIdx++] = 128 + (nChr >>> 12 & 63);
      aBytes [nIdx++] = 128 + (nChr >>> 6 & 63);
      aBytes [nIdx++] = 128 + (nChr & 63);
    }
    else /* if (nChr <= 0x7fffffff) */
    {
      /* six bytes */
      aBytes [nIdx++] = 252 + (nChr >>> 30);
      aBytes [nIdx++] = 128 + (nChr >>> 24 & 63);
      aBytes [nIdx++] = 128 + (nChr >>> 18 & 63);
      aBytes [nIdx++] = 128 + (nChr >>> 12 & 63);
      aBytes [nIdx++] = 128 + (nChr >>> 6 & 63);
      aBytes [nIdx++] = 128 + (nChr & 63);
    }
  }

  return aBytes;
}

Armored.String.arrayBufferToString = function (inBuffer)
{
	var	array = null;
	
	// check someone didn't send a typed array in here
	if (typeof (inBuffer.length) == "number")
	{
		console.error ("TypedArray passed to arrayBufferToString()");

		array = inBuffer;
	}
	else
	{
		array = new Uint8Array (inBuffer);
	}
	
	return Armored.String.uint8ArrayToString (array);
}

// algorithm stolen from Mozilla's base64.js
Armored.String.uint8ArrayToString = function (inArray)
{
	// check someone didn't send an ArrayBuffer in here
	if (typeof (inArray.length) == "undefined")
	{
		console.error ("ArrayBuffer passed to encodeUInt8Array()");
		inArray = new Uint8Array (inArray);
	}

  var sView = "";

  for (var nPart, nLen = inArray.length, nIdx = 0; nIdx < nLen; nIdx++)
  {
    nPart = inArray [nIdx];

    sView += String.fromCharCode
    (
      nPart > 251 && nPart < 254 && nIdx + 5 < nLen ? /* six bytes */
        /* (nPart - 252 << 30) may be not so safe in ECMAScript! So...: */
        (nPart - 252) * 1073741824 + (inArray [++nIdx] - 128 << 24) + (inArray [++nIdx] - 128 << 18) + (inArray [++nIdx] - 128 << 12) + (inArray [++nIdx] - 128 << 6) + inArray [++nIdx] - 128
      : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ? /* five bytes */
        (nPart - 248 << 24) + (inArray [++nIdx] - 128 << 18) + (inArray [++nIdx] - 128 << 12) + (inArray [++nIdx] - 128 << 6) + inArray [++nIdx] - 128
      : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ? /* four bytes */
        (nPart - 240 << 18) + (inArray [++nIdx] - 128 << 12) + (inArray [++nIdx] - 128 << 6) + inArray [++nIdx] - 128
      : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ? /* three bytes */
        (nPart - 224 << 12) + (inArray [++nIdx] - 128 << 6) + inArray [++nIdx] - 128
      : nPart > 191 && nPart < 224 && nIdx + 1 < nLen ? /* two bytes */
        (nPart - 192 << 6) + inArray [++nIdx] - 128
      : /* nPart < 127 ? */ /* one byte */
        nPart
    );
  }

  return sView;

}


