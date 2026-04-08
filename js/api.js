// api.js - handles all the API calls to football-data.org

// using local proxy because the API has CORS issues otherwise
// run: node proxy.js (in a separate terminal)
var API_BASE = 'http://localhost:3001/v4';
var API_TOKEN = '031e1bba89794904aab1059658386a23';

// all the competitions available on the free tier
var COMPETITIONS = [
    { code: 'PL', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
    { code: 'PD', name: 'La Liga', flag: '🇪🇸', country: 'Spain' },
    { code: 'SA', name: 'Serie A', flag: '🇮🇹', country: 'Italy' },
    { code: 'BL1', name: 'Bundesliga', flag: '🇩🇪', country: 'Germany' },
    { code: 'FL1', name: 'Ligue 1', flag: '🇫🇷', country: 'France' },
    { code: 'CL', name: 'Champions League', flag: '🏆', country: 'Europe' },
    { code: 'BSA', name: 'Série A', flag: '🇧🇷', country: 'Brazil' }
];

// wrapper for fetch with the auth token
function apiFetch(endpoint) {
    return fetch(API_BASE + endpoint, {
        headers: { 'X-Auth-Token': API_TOKEN }
    })
        .then(function (response) {
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Rate limit reached. Please wait a moment and try again.');
                }
                throw new Error('API Error: ' + response.status + ' ' + response.statusText);
            }
            return response.json();
        });
}

function fetchMatches(code) {
    return apiFetch('/competitions/' + code + '/matches');
}

function fetchStandings(code) {
    return apiFetch('/competitions/' + code + '/standings');
}

function fetchScorers(code) {
    return apiFetch('/competitions/' + code + '/scorers');
}
