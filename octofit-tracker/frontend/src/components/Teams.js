import React, { useState, useEffect } from 'react';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const codespaceName = process.env.REACT_APP_CODESPACE_NAME;
  const apiUrl = codespaceName
    ? `https://${codespaceName}-8000.app.github.dev/api/teams/`
    : 'http://localhost:8000/api/teams/';

  useEffect(() => {
    console.log('Teams: fetching from REST API endpoint:', apiUrl);
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Teams: fetched data:', data);
        // Handle both paginated (.results) and plain array responses
        const items = Array.isArray(data) ? data : data.results || [];
        setTeams(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Teams: error fetching data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [apiUrl]);

  if (loading) return (
    <div className="octofit-spinner-wrapper">
      <div className="spinner-border octofit-spinner" role="status">
        <span className="visually-hidden">Loading teams...</span>
      </div>
    </div>
  );
  if (error) return <div className="alert alert-danger mt-4"><strong>Error:</strong> {error}</div>;

  return (
    <div className="mt-4">
      <div className="card octofit-table-card">
        <div className="card-header">
          <h2>🤝 Teams</h2>
          <span className="badge bg-primary">{teams.length} teams</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover octofit-table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team Name</th>
                  <th>Members</th>
                  <th>Member Count</th>
                </tr>
              </thead>
              <tbody>
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">No teams found.</td>
                  </tr>
                ) : (
                  teams.map((team, index) => (
                    <tr key={team.id}>
                      <td><span className="badge bg-secondary">{index + 1}</span></td>
                      <td><strong>{team.name}</strong></td>
                      <td>
                        {Array.isArray(team.members) && team.members.length > 0
                          ? team.members.map((m, i) => (
                              <span key={i} className="badge bg-light text-dark border me-1 mb-1">
                                {typeof m === 'object' ? m.username : m}
                              </span>
                            ))
                          : <span className="text-muted">No members</span>}
                      </td>
                      <td>
                        <span className="badge bg-primary">
                          {Array.isArray(team.members) ? team.members.length : 0}
                        </span>
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

export default Teams;
