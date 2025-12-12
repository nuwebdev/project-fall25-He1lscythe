import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import ApiService from "../services/api";

export default function UserProfile() {
  const { user, updateUser, loading } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", open: true });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setForm({ username: user.username, email: user.email, open: user.open });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updated = await ApiService.updateProfile(form);
      updateUser(updated.user);
      setMessage({ type: 'success', text: 'Saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = user && (
    form.username !== user.username ||
    form.email !== user.email ||
    form.open !== user.open
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Profile Settings
        </h1>

        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          } ${message.text ? 'visible' : 'invisible'}`}
        >
          {message.text}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          {/* Open Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Public Profile
              </label>
              <p className="text-xs text-gray-500">
                Allow others to view your profile
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, open: !prev.open }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.open ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                  form.open ? "translate-x-5" : "translate-x-0"
                }`}
              ></span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!hasChanges || saving}
            className={`w-full py-2.5 rounded-lg font-medium transition ${
              hasChanges && !saving
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
