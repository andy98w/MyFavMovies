import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface ExtendedUser {
  id: number;
  username: string;
  email: string;
  profilePic?: string;
  Biography?: string;
  FacebookLink?: string;
  InstagramLink?: string;
  YoutubeLink?: string;
  GithubLink?: string;
}

const Profile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
  // User profile state
  const [biography, setBiography] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [githubLink, setGithubLink] = useState('');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  
  // Fetch extended user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Set state from response
        setBiography(response.data.Biography || '');
        setFacebookLink(response.data.FacebookLink || '');
        setInstagramLink(response.data.InstagramLink || '');
        setYoutubeLink(response.data.YoutubeLink || '');
        setGithubLink(response.data.GithubLink || '');
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load your profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle profile update
  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await axios.put(
        `${API_URL}/api/users/update`,
        {
          biography,
          facebook_link: facebookLink,
          instagram_link: instagramLink,
          youtube_link: youtubeLink,
          github_link: githubLink
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setMessage('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await axios.post(
        `${API_URL}/api/users/change-password`,
        {
          current_password: currentPassword,
          new_password: newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="container">
        <div style={{ marginTop: '150px', textAlign: 'center' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginBottom: '80px' }}>
      <div className="profile-header">
        <img 
          src={user?.profilePic || '/default.jpg'} 
          alt={user?.username || 'Profile'} 
          className="profile-pic-large" 
        />
        <div>
          <h1 className="profile-username">{user?.username}</h1>
          <p style={{ color: 'var(--primary-color)', opacity: 0.9, margin: '0' }}>{user?.email}</p>
        </div>
      </div>

      {error && (
        <div className="message error">
          <p>{error}</p>
        </div>
      )}

      {message && (
        <div className="message success">
          <p>{message}</p>
        </div>
      )}
      
      {/* Tab Navigation */}
      <div style={{ marginTop: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex' }}>
        <button 
          onClick={() => setActiveTab('profile')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: activeTab === 'profile' ? 'var(--primary-color)' : 'var(--text-color)',
            borderBottom: activeTab === 'profile' ? '2px solid var(--primary-color)' : 'none',
            padding: '10px 20px',
            marginRight: '10px',
            cursor: 'pointer',
            fontWeight: activeTab === 'profile' ? 'bold' : 'normal',
            marginLeft: 0,
            marginTop: 0,
            width: 'auto'
          }}
        >
          Profile Information
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: activeTab === 'security' ? 'var(--primary-color)' : 'var(--text-color)',
            borderBottom: activeTab === 'security' ? '2px solid var(--primary-color)' : 'none',
            padding: '10px 20px',
            marginRight: '10px',
            cursor: 'pointer',
            fontWeight: activeTab === 'security' ? 'bold' : 'normal',
            marginLeft: 0,
            marginTop: 0,
            width: 'auto'
          }}
        >
          Security
        </button>
      </div>
      
      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Profile Information</h2>
            <button 
              onClick={() => setEditMode(!editMode)}
              style={{ 
                background: 'var(--primary-color)',
                color: 'var(--background-dark)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                margin: 0,
                width: 'auto'
              }}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
          
          {editMode ? (
            <form onSubmit={handleProfileUpdate}>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="biography" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>About Me</label>
                <textarea 
                  id="biography"
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  style={{ 
                    width: '100%', 
                    height: '150px', 
                    padding: '12px',
                    background: 'var(--nav-background)',
                    border: '1px solid var(--primary-color)',
                    borderRadius: '8px',
                    color: 'var(--text-color)',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                  placeholder="Write something about yourself..."
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '30px', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Social Media Links</h3>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="facebook" style={{ display: 'block', marginBottom: '8px' }}>
                  <i style={{ marginRight: '8px', color: '#1877F2' }}>📘</i> Facebook
                </label>
                <input 
                  type="url"
                  id="facebook"
                  value={facebookLink}
                  onChange={(e) => setFacebookLink(e.target.value)}
                  placeholder="https://facebook.com/yourusername"
                  style={{ 
                    width: '100%',
                    background: 'var(--nav-background)',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="instagram" style={{ display: 'block', marginBottom: '8px' }}>
                  <i style={{ marginRight: '8px', color: '#C13584' }}>📷</i> Instagram
                </label>
                <input 
                  type="url"
                  id="instagram"
                  value={instagramLink}
                  onChange={(e) => setInstagramLink(e.target.value)}
                  placeholder="https://instagram.com/yourusername"
                  style={{ 
                    width: '100%',
                    background: 'var(--nav-background)',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="youtube" style={{ display: 'block', marginBottom: '8px' }}>
                  <i style={{ marginRight: '8px', color: '#FF0000' }}>🎥</i> YouTube
                </label>
                <input 
                  type="url"
                  id="youtube"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  placeholder="https://youtube.com/c/yourchannel"
                  style={{ 
                    width: '100%',
                    background: 'var(--nav-background)',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <label htmlFor="github" style={{ display: 'block', marginBottom: '8px' }}>
                  <i style={{ marginRight: '8px', color: '#FFFFFF' }}>🐙</i> GitHub
                </label>
                <input 
                  type="url"
                  id="github"
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  placeholder="https://github.com/yourusername"
                  style={{ 
                    width: '100%',
                    background: 'var(--nav-background)',
                  }}
                />
              </div>
              
              <button 
                type="submit"
                style={{ 
                  background: 'var(--primary-color)',
                  color: 'var(--background-dark)',
                  marginTop: '10px'
                }}
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>About Me</h3>
              </div>
              <div style={{ 
                background: 'var(--nav-background)', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '30px'
              }}>
                {biography ? (
                  <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{biography}</p>
                ) : (
                  <p style={{ opacity: 0.7, fontStyle: 'italic' }}>No biography provided. Click 'Edit Profile' to add information about yourself.</p>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '30px', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Social Media</h3>
              </div>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '20px',
                marginBottom: '30px'
              }}>
                {facebookLink && (
                  <a 
                    href={facebookLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '10px 15px',
                      background: '#1877F2',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>📘</span>
                    Facebook
                  </a>
                )}
                
                {instagramLink && (
                  <a 
                    href={instagramLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '10px 15px',
                      background: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>📷</span>
                    Instagram
                  </a>
                )}
                
                {youtubeLink && (
                  <a 
                    href={youtubeLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '10px 15px',
                      background: '#FF0000',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>🎥</span>
                    YouTube
                  </a>
                )}
                
                {githubLink && (
                  <a 
                    href={githubLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '10px 15px',
                      background: '#24292E',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>🐙</span>
                    GitHub
                  </a>
                )}
                
                {!facebookLink && !instagramLink && !youtubeLink && !githubLink && (
                  <p style={{ opacity: 0.7, fontStyle: 'italic' }}>No social media links provided. Click 'Edit Profile' to add your social media profiles.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Security Tab */}
      {activeTab === 'security' && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Security Settings</h2>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Change Password</h3>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="currentPassword" style={{ display: 'block', marginBottom: '8px' }}>
                  Current Password
                </label>
                <input 
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  style={{ 
                    width: '100%',
                    background: 'var(--nav-background)',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '8px' }}>
                  New Password
                </label>
                <input 
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  minLength={6}
                  style={{ 
                    width: '100%',
                    background: 'var(--nav-background)',
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px' }}>
                  Confirm New Password
                </label>
                <input 
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  minLength={6}
                  style={{ 
                    width: '100%',
                    background: 'var(--nav-background)',
                  }}
                />
              </div>
              
              <button 
                type="submit"
                style={{ 
                  background: 'var(--primary-color)',
                  color: 'var(--background-dark)',
                  marginTop: '10px'
                }}
              >
                Update Password
              </button>
            </form>
          </div>
          
          <div style={{ marginTop: '50px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#FF6B6B' }}>Account Management</h3>
            </div>
            <button 
              onClick={logout}
              style={{ 
                background: 'rgba(255, 107, 107, 0.1)',
                color: '#FF6B6B',
                border: '1px solid #FF6B6B',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                marginTop: '10px',
                width: 'auto'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;