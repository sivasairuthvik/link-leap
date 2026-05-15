import { useState } from "react";

export default function DashboardSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    darkMode: false,
    twoFactor: false,
  });

  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  const handleSettingChange = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handlePasswordChange = (e) => {
    setChangePasswordForm({
      ...changePasswordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitPasswordChange = (e) => {
    e.preventDefault();
    if (changePasswordForm.newPassword !==changePasswordForm.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    // TODO: Implement password change API
    setMessage("Password changed successfully!");
    setChangePasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="settings-container">
      <div className="settings-section">
        <h3>Security Settings</h3>
        <div className="setting-item">
          <div className="setting-info">
            <h4>Email Notifications</h4>
            <p>Get notified when links receive clicks</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={() => handleSettingChange("emailNotifications")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Two-Factor Authentication</h4>
            <p>Add an extra layer of security to your account</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.twoFactor}
              onChange={() => handleSettingChange("twoFactor")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>Change Password</h3>
        <form onSubmit={handleSubmitPasswordChange} className="settings-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={changePasswordForm.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter your current password"
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={changePasswordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={changePasswordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
            />
          </div>

          {message && <div className="message">{message}</div>}

          <button type="submit" className="btn-save">
            Update Password
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h3>Preferences</h3>
        <div className="setting-item">
          <div className="setting-info">
            <h4>Dark Mode</h4>
            <p>Switch to dark theme</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={() => handleSettingChange("darkMode")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-section danger-zone">
        <h3>Danger Zone</h3>
        <button className="btn-danger">Delete Account</button>
      </div>
    </div>
  );
}
