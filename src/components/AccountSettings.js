import React, { useState, useEffect } from 'react';
import { updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useTranslation } from 'react-i18next';

const AccountSettings = ({ user, onClose, showToast }) => {
  const { t, i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState('preferences');

  const ratingLevels = {
    'G': 0,
    'PG': 1,
    'PG-13': 2,
    'R': 3,
  };

  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      recommendations: true,
      newReleases: false
    },
    privacy: {
      profileVisible: true,
      showWatchHistory: false,
      showFavorites: true
    },
    preferences: {
      autoplay: false,
      language: 'en',
      contentRating: 'PG-13',
      spoilerWarnings: true
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(`settings_${user.uid}`);
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        // Set the language to match saved preference
        if (parsedSettings.preferences?.language) {
          i18n.changeLanguage(parsedSettings.preferences.language);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, [user.uid, i18n]);

  const handleSettingChange = (section, key, value) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };
    
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem(`settings_${user.uid}`, JSON.stringify(newSettings));
    showToast('Settings saved', 'success');
  };

  const handleLanguageChange = (newLang) => {
    // Change i18n language immediately
    i18n.changeLanguage(newLang);
    // Save to settings
    handleSettingChange('preferences', 'language', newLang);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, passwordData.newPassword);
      showToast('Password updated successfully', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        showToast('Current password is incorrect', 'error');
      } else {
        showToast('Failed to update password', 'error');
      }
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, credential);
      
      // Delete user data from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes(user.uid)) {
          localStorage.removeItem(key);
        }
      });
      
      // Delete user account
      await deleteUser(user);
      showToast('Account deleted successfully', 'success');
      onClose();
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        showToast('Password is incorrect', 'error');
      } else {
        showToast('Failed to delete account', 'error');
      }
    }
  };

  const sections = [
    { id: 'preferences', label: t('preferences') || 'Preferences', icon: '⚙️' },
    { id: 'notifications', label: t('notifications') || 'Notifications', icon: '🔔' },
    { id: 'privacy', label: t('privacy') || 'Privacy', icon: '🔒' },
    { id: 'security', label: t('security') || 'Security', icon: '🛡️' },
    { id: 'account', label: t('account') || 'Account', icon: '👤' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="settings-container">
          <div className="settings-sidebar">
            <h2>{t('account_settings') || 'Account Settings'}</h2>
            {sections.map(section => (
              <button
                key={section.id}
                className={`settings-tab ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="tab-icon">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>

          <div className="settings-content">
            {activeSection === 'preferences' && (
              <div className="settings-section">
                <h3>{t('movie_preferences') || 'Movie Preferences'}</h3>
                
                <div className="setting-item">
                  <label>{t('preferred_language') || 'Preferred Language'}</label>
                  <select
                    value={settings.preferences.language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="tr">Türkçe</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>{t('content_rating_limit') || 'Content Rating Limit'}</label>
                  <select 
                    value={settings.preferences.contentRating}
                    onChange={(e) => setSettings((prev) => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        contentRating: e.target.value,
                      },
                    }))}
                  >
                    <option value="G">G - General Audiences</option>
                    <option value="PG">PG - Parental Guidance</option>
                    <option value="PG-13">PG-13 - Parents Strongly Cautioned</option>
                    <option value="R">R - Restricted</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={settings.preferences.autoplay}
                      onChange={(e) => handleSettingChange('preferences', 'autoplay', e.target.checked)}
                    />
                    {t('autoplay_trailers') || 'Auto-play trailers'}
                  </label>
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={settings.preferences.spoilerWarnings}
                      onChange={(e) => handleSettingChange('preferences', 'spoilerWarnings', e.target.checked)}
                    />
                    {t('spoiler_warnings') || 'Show spoiler warnings'}
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="settings-section">
                <h3>{t('notification_preferences') || 'Notification Preferences'}</h3>
                
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                    />
                    {t('email_notifications') || 'Email notifications'}
                  </label>
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={settings.notifications.push}
                      onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                    />
                    {t('push_notifications') || 'Push notifications'}
                  </label>
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={settings.notifications.recommendations}
                      onChange={(e) => handleSettingChange('notifications', 'recommendations', e.target.checked)}
                    />
                    {t('movie_recommendations') || 'Movie recommendations'}
                  </label>
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={settings.notifications.newReleases}
                      onChange={(e) => handleSettingChange('notifications', 'newReleases', e.target.checked)}
                    />
                    {t('new_releases_alerts') || 'New releases alerts'}
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="settings-section">
                <h3>{t('privacy_settings') || 'Privacy Settings'}</h3>
                
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={settings.privacy.profileVisible}
                      onChange={(e) => handleSettingChange('privacy', 'profileVisible', e.target.checked)}
                    />
                    {t('make_profile_public') || 'Make profile public'}
                  </label>
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={settings.privacy.showWatchHistory}
                      onChange={(e) => handleSettingChange('privacy', 'showWatchHistory', e.target.checked)}
                    />
                    {t('show_watch_history') || 'Show watch history to others'}
                  </label>
                </div>

                <div className="setting-item">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={settings.privacy.showFavorites}
                      onChange={(e) => handleSettingChange('privacy', 'showFavorites', e.target.checked)}
                    />
                    {t('show_favorites_publicly') || 'Show favorites publicly'}
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="settings-section">
                <h3>{t('change_password') || 'Change Password'}</h3>
                <form onSubmit={handlePasswordChange}>
                  <div className="setting-item">
                    <label>{t('current_password') || 'Current Password'}</label>
                    <input 
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                      required
                    />
                  </div>

                  <div className="setting-item">
                    <label>{t('new_password') || 'New Password'}</label>
                    <input 
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                      required
                      minLength="6"
                    />
                  </div>

                  <div className="setting-item">
                    <label>{t('confirm_new_password') || 'Confirm New Password'}</label>
                    <input 
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                      required
                      minLength="6"
                    />
                  </div>

                  <button type="submit" className="update-password-btn">
                    {t('update_password') || 'Update Password'}
                  </button>
                </form>
              </div>
            )}

            {activeSection === 'account' && (
              <div className="settings-section">
                <h3>{t('account_information') || 'Account Information'}</h3>
                <div className="account-info">
                  <p><strong>{t('email') || 'Email'}:</strong> {user.email}</p>
                  <p><strong>{t('account_created') || 'Account created'}:</strong> {new Date(user.metadata.creationTime).toLocaleDateString()}</p>
                  <p><strong>{t('last_sign_in') || 'Last sign in'}:</strong> {new Date(user.metadata.lastSignInTime).toLocaleDateString()}</p>
                </div>

                <div className="danger-zone">
                  <h4>{t('danger_zone') || 'Danger Zone'}</h4>
                  <p>{t('delete_account_warning') || 'Once you delete your account, there is no going back. Please be certain.'}</p>
                  
                  {!showDeleteConfirm ? (
                    <button 
                      className="delete-account-btn"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      {t('delete_account') || 'Delete Account'}
                    </button>
                  ) : (
                    <div className="delete-confirm">
                      <p>{t('confirm_delete_password') || 'Please enter your password to confirm account deletion:'}</p>
                      <input 
                        type="password"
                        placeholder={t('enter_password') || 'Enter your password'}
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                      />
                      <div className="delete-actions">
                        <button 
                          className="confirm-delete-btn"
                          onClick={handleDeleteAccount}
                          disabled={!deletePassword}
                        >
                          {t('confirm_delete') || 'Confirm Delete'}
                        </button>
                        <button 
                          className="cancel-delete-btn"
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeletePassword('');
                          }}
                        >
                          {t('cancel') || 'Cancel'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;