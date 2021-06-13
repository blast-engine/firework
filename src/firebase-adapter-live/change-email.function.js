export const changeEmail = firebase => ({ password, newEmail }) => {
  
  const reauthenticate = (password) => {
    var user = firebase.auth().currentUser;
    var cred = firebase.auth.EmailAuthProvider.credential(
      user.email, password);
    return user.reauthenticateWithCredential(cred);
  }

  return reauthenticate(password).then(() => {
    var user = firebase.auth().currentUser;
    return user.updateEmail(newEmail).then(() => 
      ({error: false, message: "Email Updated"})
    ).catch((error) => ({error: true, message: error.message}));
  }).catch((error) => ({error: true, message: error.message}));

}