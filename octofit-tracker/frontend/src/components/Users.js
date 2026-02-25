import React, { useState, useEffect, useCallback } from 'react';

function Users() {
  const [users, setUsers]   = useState([]);
  const [teams, setTeams]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  // Edit modal state
  const [editUser, setEditUser]       = useState(null);   // user being edited
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail]     = useState('');
  const [editTeamId, setEditTeamId]   = useState('');     // '' = no team
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const codespaceName = process.env.REACT_APP_CODESPACE_NAME;
  const base = codespaceName
    ? `https://${codespaceName}-8000.app.github.dev`
    : 'http://localhost:8000';
  const usersApiUrl = `${base}/api/users/`;
  const teamsApiUrl = `${base}/api/teams/`;

  // Build userId → teamId lookup from teams list
  const userTeamMap = React.useMemo(() => {
    const map = {};
    teams.forEach((team) => {
      (team.members || []).forEach((m) => {
        const uid = typeof m === 'object' ? m.id : m;
        map[uid] = team.id;
      });
    });
    return map;
  }, [teams]);

  const loadData = useCallback(() => {
    console.log('Users: fetching users and teams from:', usersApiUrl, teamsApiUrl);
    setLoading(true);
    Promise.all([
      fetch(usersApiUrl).then((r) => { if (!r.ok) throw new Error(`Users HTTP ${r.status}`); return r.json(); }),
      fetch(teamsApiUrl).then((r) => { if (!r.ok) throw new Error(`Teams HTTP ${r.status}`); return r.json(); }),
    ])
      .then(([userData, teamData]) => {
        console.log('Users: fetched users:', userData);
        console.log('Users: fetched teams:', teamData);
        setUsers(Array.isArray(userData) ? userData : userData.results || []);
        setTeams(Array.isArray(teamData) ? teamData : teamData.results || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Users: error fetching data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [usersApiUrl, teamsApiUrl]);

  useEffect(() => { loadData(); }, [loadData]);

  // Open the edit modal pre-filled with the selected user's current values
  const openEdit = (user) => {
    setEditUser(user);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditTeamId(userTeamMap[user.id] || '');
    setSaveError(null);
    setSaveSuccess(false);
  };

  const closeEdit = () => {
    setEditUser(null);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      // 1. PATCH user fields (username + email)
      const userRes = await fetch(`${usersApiUrl}${editUser.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editUsername, email: editEmail }),
      });
      if (!userRes.ok) throw new Error(`Failed to update user (HTTP ${userRes.status})`);
      console.log('Users: user PATCH successful for id', editUser.id);

      // 2. Update team membership
      const previousTeamId = userTeamMap[editUser.id] || '';

      if (previousTeamId && previousTeamId !== editTeamId) {
        // Remove user from old team
        const oldTeam = teams.find((t) => t.id === previousTeamId);
        if (oldTeam) {
          const remainingIds = (oldTeam.members || [])
            .map((m) => (typeof m === 'object' ? m.id : m))
            .filter((id) => id !== editUser.id);
          const removeRes = await fetch(`${teamsApiUrl}${previousTeamId}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ member_ids: remainingIds }),
          });
          if (!removeRes.ok) throw new Error(`Failed to remove from old team (HTTP ${removeRes.status})`);
          console.log('Users: removed user from team', oldTeam.name);
        }
      }

      if (editTeamId && editTeamId !== previousTeamId) {
        // Add user to new team
        const newTeam = teams.find((t) => t.id === editTeamId);
        if (newTeam) {
          const currentIds = (newTeam.members || [])
            .map((m) => (typeof m === 'object' ? m.id : m));
          if (!currentIds.includes(editUser.id)) {
            const addRes = await fetch(`${teamsApiUrl}${editTeamId}/`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ member_ids: [...currentIds, editUser.id] }),
            });
            if (!addRes.ok) throw new Error(`Failed to add to new team (HTTP ${addRes.status})`);
            console.log('Users: added user to team', newTeam.name);
          }
        }
      }

      setSaveSuccess(true);
      setSaving(false);
      loadData();           // refresh table with latest data
      setTimeout(closeEdit, 900);
    } catch (err) {
      console.error('Users: save error:', err);
      setSaveError(err.message);
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="octofit-spinner-wrapper">
      <div className="spinner-border octofit-spinner" role="status">
        <span className="visually-hidden">Loading users...</span>
      </div>
    </div>
  );
  if (error) return <div className="alert alert-danger mt-4"><strong>Error:</strong> {error}</div>;

  return (
    <div className="mt-4">
      <div className="card octofit-table-card">
        <div className="card-header">
          <h2>👤 Users</h2>
          <span className="badge bg-primary">{users.length} members</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover octofit-table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Team</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">No users found.</td>
                  </tr>
                ) : (
                  users.map((user, index) => {
                    const team = teams.find((t) => t.id === userTeamMap[user.id]);
                    return (
                      <tr key={user.id}>
                        <td><span className="badge bg-secondary">{index + 1}</span></td>
                        <td>
                          <strong>
                            {user.username
                              ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
                              : '—'}
                          </strong>
                        </td>
                        <td><code className="text-success">{user.username}</code></td>
                        <td>
                          <a href={`mailto:${user.email}`} className="text-decoration-none">{user.email}</a>
                        </td>
                        <td>
                          {team
                            ? <span className="badge bg-info text-dark">{team.name}</span>
                            : <span className="text-muted">—</span>}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => openEdit(user)}
                          >
                            ✏️ Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editUser && (
        <>
          {/* Backdrop */}
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={closeEdit} />

          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }} role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">

                <div className="modal-header" style={{ background: 'linear-gradient(90deg,#0d2818,#0f3d22)', color: '#fff' }}>
                  <h5 className="modal-title">✏️ Edit User &mdash; <em>{editUser.username}</em></h5>
                  <button type="button" className="btn-close btn-close-white" onClick={closeEdit} aria-label="Close" />
                </div>

                <div className="modal-body">
                  {saveError   && <div className="alert alert-danger py-2">{saveError}</div>}
                  {saveSuccess && <div className="alert alert-success py-2">Saved successfully!</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="Username"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Email address"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Team</label>
                    <select
                      className="form-select"
                      value={editTeamId}
                      onChange={(e) => setEditTeamId(e.target.value)}
                    >
                      <option value="">— No team —</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeEdit} disabled={saving}>
                    Cancel
                  </button>
                  <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" />Saving…</>
                    ) : '💾 Save Changes'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Users;


  useEffect(() => {
    console.log('Users: fetching from REST API endpoint:', apiUrl);
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Users: fetched data:', data);
        // Handle both paginated (.results) and plain array responses
        const items = Array.isArray(data) ? data : data.results || [];
        setUsers(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Users: error fetching data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [apiUrl]);

  if (loading) return (
    <div className="octofit-spinner-wrapper">
      <div className="spinner-border octofit-spinner" role="status">
        <span className="visually-hidden">Loading users...</span>
      </div>
    </div>
  );
  if (error) return <div className="alert alert-danger mt-4"><strong>Error:</strong> {error}</div>;

  return (
    <div className="mt-4">
      <div className="card octofit-table-card">
        <div className="card-header">
          <h2>👤 Users</h2>
          <span className="badge bg-primary">{users.length} members</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover octofit-table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">No users found.</td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.id}>
                      <td><span className="badge bg-secondary">{index + 1}</span></td>
                      <td>
                        <strong>
                          {user.username
                            ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
                            : '—'}
                        </strong>
                      </td>
                      <td>
                        <code className="text-success">{user.username}</code>
                      </td>
                      <td>
                        <a href={`mailto:${user.email}`} className="text-decoration-none">{user.email}</a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users;
