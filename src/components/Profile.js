import React from 'react';
import { auth } from '../firebase/config';

const Profile = ({ user }) => {
  const initials = user?.email?.split('@')[0].slice(0, 2).toUpperCase();
  const joinDate = new Date(user?.metadata?.creationTime).toLocaleDateString();

  return (
    <div className="profile-container">
      <div className="avatar-circle">{initials}</div>
      <h2>{user.email}</h2>
      <p>Member since: {joinDate}</p>
    </div>
  );
};

export default Profile;
