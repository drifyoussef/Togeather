import React from 'react';
import './Profile.css';

const Profile: React.FC = () => {
    const changeSettings = () => {
        alert('Change settings clicked');
    };

    return (
      <div className='div-profile'>
        <div className="profileCard">
            <div className="profileImage"></div>
            <div className="profileInfo">
                <h2>John Doe</h2>
                <p>Web Developer</p>
                <button onClick={changeSettings}>Change Settings</button>
            </div>
        </div>
      </div>
    );
};

export default Profile;
