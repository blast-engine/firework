export const changePassword = firebase => ({ currentPassword, newPassword }) => {
  
  const reauthenticate = (currentPassword) => {
    var user = firebase.auth().currentUser;
    var cred = firebase.auth.EmailAuthProvider.credential(
      user.email, currentPassword);
    return user.reauthenticateWithCredential(cred);
  }

  return reauthenticate(currentPassword).then(() => {
    var user = firebase.auth().currentUser;
    return user.updatePassword(newPassword).then(() => 
      ({error: false, message: "Password Updated"})
    ).catch((error) => ({error: true, message: error.message}));
  }).catch((error) => ({error: true, message: error.message}));

}