import React, { useState, useEffect } from 'react';

function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const codespaceName = process.env.REACT_APP_CODESPACE_NAME;
  const base = codespaceName
    ? `https://${codespaceName}-8000.app.github.dev`
    : 'http://localhost:8000';

  const apiUrl          = `${base}/api/leaderboard/`;
  const teamsApiUrl     = `${base}/api/teams/`;
  const activitiesApiUrl = `${base}/api/activities/`;

  useEffect(() => {
    console.log('Leaderboard: fetching from REST API endpoints:', apiUrl, teamsApiUrl, activitiesApiUrl);

    const fetchJson = (url) =>
      fetch(url).then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status} for ${url}`);
        return r.json();
      });

    Promise.all([fetchJson(apiUrl), fetchJson(teamsApiUrl), fetchJson(activitiesApiUrl)])
      .then(([leaderboardData, teamsData, activitiesData]) => {
        console.log('Leaderboard: leaderboard data:', leaderboardData);
        console.log('Leaderboard: teams data:', teamsData);
        console.log('Leaderboard: activities data:', activitiesData);

        const leaderboard  = Array.isArray(leaderboardData)  ? leaderboardData  : leaderboardData.results  || [];
        const teams        = Array.isArray(teamsData)         ? teamsData        : teamsData.results        || [];
        const activities   = Array.isArray(activitiesData)    ? activitiesData   : activitiesData.results   || [];

        // Build userId → team name map
        const userTeamMap = {};
        teams.forEach((team) => {
          (team.members || []).forEach((member) => {
            const uid = typeof member === 'object' ? member.id : member;
            userTeamMap[uid] = team.name;
          });
        });

        // Build userId → total calories map (calories ≈ duration_minutes × 7)
        const userCaloriesMap = {};
        activities.forEach((activity) => {
          const uid = typeof activity.user === 'object' ? activity.user.id : activity.user;
          const cals = Math.round((activity.duration || 0) * 7);
          userCaloriesMap[uid] = (userCaloriesMap[uid] || 0) + cals;
        });

        // Enrich leaderboard entries and sort by score descending
        const enriched = leaderboard
          .map((entry) => {
            const uid = typeof entry.user === 'object' ? entry.user.id : entry.user;
            return {
              ...entry,
              _username: typeof entry.user === 'object' ? entry.user.username : entry.user,
              _team:     userTeamMap[uid]     || '—',
              _calories: userCaloriesMap[uid] || 0,
            };
          })
          .sort((a, b) => b.score - a.score);

        setEntries(enriched);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Leaderboard: error fetching data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [apiUrl, teamsApiUrl, activitiesApiUrl]);

  if (loading) return (
    <div className="octofit-spinner-wrapper">
      <div className="spinner-border octofit-spinner" role="status">
        <span className="visually-hidden">Loading leaderboard...</span>
      </div>
    </div>
  );
  if (error) return <div className="alert alert-danger mt-4"><strong>Error:</strong> {error}</div>;

  const rankClass = (i) => i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'bg-light text-dark';

  return (
    <div className="mt-4">
      <div className="card octofit-table-card">
        <div className="card-header">
          <h2>🏆 Leaderboard</h2>
          <span className="badge bg-warning text-dark">{entries.length} entries</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover octofit-table mb-0">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Team</th>
                  <th>Total Calories</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">No leaderboard entries found.</td>
                  </tr>
                ) : (
                  entries.map((entry, index) => (
                    <tr key={entry.id}>
                      <td>
                        <span className={`badge ${rankClass(index)} px-3 py-2`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                      </td>
                      <td><strong>{entry._username}</strong></td>
                      <td><span className="badge bg-secondary">{entry._team}</span></td>
                      <td><span className="badge bg-warning text-dark">{entry._calories} kcal</span></td>
                      <td><span className="badge bg-success fs-6">{entry.score}</span></td>
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

export default Leaderboard;
