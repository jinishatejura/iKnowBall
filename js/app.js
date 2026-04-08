// app.js - main application logic

// state object to keep track of everything
var state = {
    activeCompetition: 'PL',
    activeTab: 'matches',
    matchesData: null,
    standingsData: null,
    scorersData: null,
    searchQuery: '',
    sortOption: 'default',
    isLoading: false,
    error: null,
    currentMatchday: null,
    totalMatchdays: null,
    matchPages: [],
    currentPageIndex: 0,
    isMultiStage: false
};

// grab all the DOM elements we need
var competitionList = document.getElementById('competition-list');
var tabBtns = document.querySelectorAll('.tab-btn');
var contentArea = document.getElementById('content-area');
var searchInput = document.getElementById('search-input');
var sortSelect = document.getElementById('sort-select');
var themeToggle = document.getElementById('theme-toggle');
var themeIcon = document.getElementById('theme-icon');
var competitionTitle = document.getElementById('competition-title');
var mobileMenuBtn = document.getElementById('mobile-menu-btn');
var sidebar = document.getElementById('sidebar');
var overlay = document.getElementById('sidebar-overlay');
var backToTopBtn = document.getElementById('back-to-top');
var matchdayNav = document.getElementById('matchday-nav');
var matchdayLabel = document.getElementById('matchday-label');
var prevMatchdayBtn = document.getElementById('prev-matchday');
var nextMatchdayBtn = document.getElementById('next-matchday');

function init() {
    var theme = ThemeManager.init();
    updateThemeIcon(theme);
    renderCompetitions();
    bindEvents();
    loadData();
}

function bindEvents() {
    // tab switching
    tabBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var tab = this.getAttribute('data-tab');
            setActiveTab(tab);
        });
    });

    // search with debounce so it doesn't lag
    var debouncedSearch = debounce(function (e) {
        state.searchQuery = e.target.value.trim().toLowerCase();
        renderContent();
    }, 350);
    searchInput.addEventListener('input', debouncedSearch);

    sortSelect.addEventListener('change', function () {
        state.sortOption = this.value;
        renderContent();
    });

    themeToggle.addEventListener('click', function () {
        var newTheme = ThemeManager.toggle();
        updateThemeIcon(newTheme);
    });

    // mobile menu
    mobileMenuBtn.addEventListener('click', function () {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', function () {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });

    // back to top
    backToTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function () {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    // previous matchday/stage
    prevMatchdayBtn.addEventListener('click', function () {
        if (state.isMultiStage) {
            if (state.currentPageIndex > 0) {
                state.currentPageIndex = state.currentPageIndex - 1;
                var page = state.matchPages[state.currentPageIndex];
                state.currentMatchday = page.matchday;
                renderContent();
                updateMatchdayNav();
            }
        } else {
            if (state.currentMatchday > 1) {
                state.currentMatchday = state.currentMatchday - 1;
                renderContent();
                updateMatchdayNav();
            }
        }
    });

    // next matchday/stage
    nextMatchdayBtn.addEventListener('click', function () {
        if (state.isMultiStage) {
            if (state.currentPageIndex < state.matchPages.length - 1) {
                state.currentPageIndex = state.currentPageIndex + 1;
                var page = state.matchPages[state.currentPageIndex];
                state.currentMatchday = page.matchday;
                renderContent();
                updateMatchdayNav();
            }
        } else {
            if (state.currentMatchday < state.totalMatchdays) {
                state.currentMatchday = state.currentMatchday + 1;
                renderContent();
                updateMatchdayNav();
            }
        }
    });
}

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.textContent = '🌙';
    } else {
        themeIcon.textContent = '☀️';
    }
}

// renders the sidebar with all the competitions
function renderCompetitions() {
    var favs = FavoritesManager.getAll();

    // sort so favorites show up first, then alphabetical
    var sorted = COMPETITIONS.slice().sort(function (a, b) {
        var aFav = favs.indexOf(a.code) !== -1 ? -1 : 0;
        var bFav = favs.indexOf(b.code) !== -1 ? -1 : 0;
        if (aFav !== bFav) return aFav - bFav;
        return a.name.localeCompare(b.name);
    });

    // build the html for each competition item
    var html = sorted.map(function (comp) {
        var isActive = comp.code === state.activeCompetition;
        var isFav = favs.indexOf(comp.code) !== -1;
        var activeClass = isActive ? 'active' : '';
        var favClass = isFav ? 'is-fav' : '';
        var starIcon = isFav ? '★' : '☆';

        return '<li class="comp-item ' + activeClass + '" data-code="' + comp.code + '">' +
            '<button class="comp-btn" data-code="' + comp.code + '">' +
            '<span class="comp-flag">' + comp.flag + '</span>' +
            '<span class="comp-name">' + comp.name + '</span>' +
            '</button>' +
            '<button class="fav-btn ' + favClass + '" data-code="' + comp.code + '" title="Toggle favorite">' +
            starIcon +
            '</button>' +
            '</li>';
    }).join('');

    competitionList.innerHTML = html;

    // click handlers for competitions
    var compBtns = competitionList.querySelectorAll('.comp-btn');
    compBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            state.activeCompetition = this.getAttribute('data-code');
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            renderCompetitions();
            loadData();
        });
    });

    // favorite star buttons
    var favBtns = competitionList.querySelectorAll('.fav-btn');
    favBtns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            FavoritesManager.toggle(this.getAttribute('data-code'));
            renderCompetitions();
        });
    });
}

function setActiveTab(tab) {
    state.activeTab = tab;
    state.searchQuery = '';
    state.sortOption = 'default';
    searchInput.value = '';
    sortSelect.value = 'default';

    tabBtns.forEach(function (btn) {
        if (btn.getAttribute('data-tab') === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // show/hide matchday pagination
    var hasPages = (state.isMultiStage && state.matchPages.length > 0) || state.totalMatchdays > 0;
    if (tab === 'matches' && hasPages) {
        matchdayNav.classList.add('visible');
    } else {
        matchdayNav.classList.remove('visible');
    }

    updateSearchSortOptions(tab);
    renderContent();
}

function updateSearchSortOptions(tab) {
    if (tab === 'matches') {
        searchInput.placeholder = 'Search teams...';
    } else if (tab === 'standings') {
        searchInput.placeholder = 'Search teams...';
    } else if (tab === 'scorers') {
        searchInput.placeholder = 'Search players...';
    } else {
        searchInput.placeholder = 'Search...';
    }

    if (tab === 'matches') {
        sortSelect.innerHTML =
            '<option value="default">Sort: Default</option>' +
            '<option value="date-asc">Date ↑</option>' +
            '<option value="date-desc">Date ↓</option>' +
            '<option value="home-az">Home Team A-Z</option>' +
            '<option value="home-za">Home Team Z-A</option>' +
            '<option value="status">By Status</option>';
    } else if (tab === 'standings') {
        sortSelect.innerHTML =
            '<option value="default">Sort: Position</option>' +
            '<option value="points-desc">Points ↓</option>' +
            '<option value="points-asc">Points ↑</option>' +
            '<option value="gd-desc">Goal Diff ↓</option>' +
            '<option value="gd-asc">Goal Diff ↑</option>' +
            '<option value="team-az">Team A-Z</option>' +
            '<option value="won-desc">Most Wins</option>';
    } else if (tab === 'scorers') {
        sortSelect.innerHTML =
            '<option value="default">Sort: Goals</option>' +
            '<option value="goals-desc">Goals ↓</option>' +
            '<option value="goals-asc">Goals ↑</option>' +
            '<option value="assists-desc">Assists ↓</option>' +
            '<option value="assists-asc">Assists ↑</option>' +
            '<option value="name-az">Name A-Z</option>' +
            '<option value="name-za">Name Z-A</option>';
    }
}

function updateMatchdayNav() {
    if (state.isMultiStage && state.matchPages.length > 0) {
        var page = state.matchPages[state.currentPageIndex];
        matchdayLabel.textContent = page.label;
        prevMatchdayBtn.disabled = state.currentPageIndex <= 0;
        nextMatchdayBtn.disabled = state.currentPageIndex >= state.matchPages.length - 1;

        if (state.activeTab === 'matches') {
            matchdayNav.classList.add('visible');
        }
    } else if (state.currentMatchday && state.totalMatchdays) {
        matchdayLabel.textContent = 'Matchday ' + state.currentMatchday + ' of ' + state.totalMatchdays;
        prevMatchdayBtn.disabled = state.currentMatchday <= 1;
        nextMatchdayBtn.disabled = state.currentMatchday >= state.totalMatchdays;

        if (state.activeTab === 'matches') {
            matchdayNav.classList.add('visible');
        }
    } else {
        matchdayNav.classList.remove('visible');
    }
}

// loads all data for the selected competition
function loadData() {
    var code = state.activeCompetition;

    var comp = COMPETITIONS.find(function (c) {
        return c.code === code;
    });
    competitionTitle.textContent = comp ? comp.name : '';

    // reset everything
    state.isLoading = true;
    state.error = null;
    state.matchesData = null;
    state.standingsData = null;
    state.scorersData = null;
    state.currentMatchday = null;
    state.totalMatchdays = null;
    state.matchPages = [];
    state.currentPageIndex = 0;
    state.isMultiStage = false;
    matchdayNav.classList.remove('visible');
    renderContent();

    // fetch matches, standings and scorers at the same time
    Promise.allSettled([
        fetchMatches(code),
        fetchStandings(code),
        fetchScorers(code)
    ]).then(function (results) {
        if (results[0].status === 'fulfilled') {
            state.matchesData = results[0].value;
        }
        if (results[1].status === 'fulfilled') {
            state.standingsData = results[1].value;
        }
        if (results[2].status === 'fulfilled') {
            state.scorersData = results[2].value;
        }

        // figure out pagination
        if (state.matchesData && state.matchesData.matches && state.matchesData.matches.length > 0) {
            // check if theres multiple stages (like in champions league)
            var uniqueStages = state.matchesData.matches.reduce(function (acc, m) {
                var stage = m.stage || 'REGULAR_SEASON';
                if (acc.indexOf(stage) === -1) {
                    acc.push(stage);
                }
                return acc;
            }, []);

            state.isMultiStage = uniqueStages.length > 1;

            if (state.isMultiStage) {
                // for competitions like UCL that have league phase + knockouts
                var stageOrder = [
                    'LEAGUE_STAGE', 'LEAGUE_STAGE_EXTRA',
                    'PLAYOFFS', 'LAST_16', 'QUARTER_FINALS',
                    'SEMI_FINALS', 'THIRD_PLACE', 'FINAL',
                    'GROUP_STAGE', 'PRELIMINARY_ROUND',
                    'PRELIMINARY_SEMI_FINALS', 'PRELIMINARY_FINAL',
                    'ROUND_1', 'ROUND_2', 'ROUND_3',
                    'FIRST_QUALIFYING_ROUND', 'SECOND_QUALIFYING_ROUND',
                    'THIRD_QUALIFYING_ROUND', 'PLAY_OFF_ROUND'
                ];

                var stageLabels = {
                    'LEAGUE_STAGE': 'League Phase',
                    'LEAGUE_STAGE_EXTRA': 'League Phase Extra',
                    'GROUP_STAGE': 'Group Stage',
                    'PLAYOFFS': 'Playoffs',
                    'LAST_16': 'Round of 16',
                    'QUARTER_FINALS': 'Quarter-Finals',
                    'SEMI_FINALS': 'Semi-Finals',
                    'THIRD_PLACE': 'Third Place',
                    'FINAL': 'Final',
                    'PRELIMINARY_ROUND': 'Preliminary Round',
                    'ROUND_1': 'Round 1',
                    'ROUND_2': 'Round 2',
                    'ROUND_3': 'Round 3'
                };

                // collect all unique stage+matchday combos
                var pageKeys = state.matchesData.matches.reduce(function (acc, m) {
                    var stage = m.stage || 'REGULAR_SEASON';
                    var md = m.matchday;
                    var key = stage + '|' + md;
                    if (acc.indexOf(key) === -1) {
                        acc.push(key);
                    }
                    return acc;
                }, []);

                // parse them into page objects and sort properly
                state.matchPages = pageKeys.map(function (key) {
                    var parts = key.split('|');
                    var stage = parts[0];
                    var md = parts[1] === 'null' ? null : parseInt(parts[1], 10);
                    return { stage: stage, matchday: md };
                }).sort(function (a, b) {
                    var aIdx = stageOrder.indexOf(a.stage);
                    var bIdx = stageOrder.indexOf(b.stage);
                    if (aIdx === -1) aIdx = 999;
                    if (bIdx === -1) bIdx = 999;
                    if (aIdx !== bIdx) return aIdx - bIdx;
                    var aMd = a.matchday || 0;
                    var bMd = b.matchday || 0;
                    return aMd - bMd;
                });

                // give each page a nice label
                state.matchPages.forEach(function (page) {
                    var stageName = stageLabels[page.stage] || page.stage.replace(/_/g, ' ');
                    if (page.stage === 'FINAL' || page.stage === 'THIRD_PLACE') {
                        page.label = stageName;
                    } else if (page.matchday) {
                        var isKnockout = ['PLAYOFFS', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS'].indexOf(page.stage) !== -1;
                        if (isKnockout) {
                            page.label = stageName + ' — Leg ' + page.matchday;
                        } else {
                            page.label = stageName + ' — MD ' + page.matchday;
                        }
                    } else {
                        page.label = stageName;
                    }
                });

                // start on the latest page that has finished matches
                var latestFinishedIdx = 0;
                state.matchPages.forEach(function (page, idx) {
                    var hasFinished = state.matchesData.matches.some(function (m) {
                        return (m.stage || 'REGULAR_SEASON') === page.stage &&
                            m.matchday === page.matchday &&
                            m.status === 'FINISHED';
                    });
                    if (hasFinished) latestFinishedIdx = idx;
                });

                state.currentPageIndex = latestFinishedIdx;
                state.currentMatchday = state.matchPages[latestFinishedIdx].matchday;
                state.totalMatchdays = state.matchPages.length;

                updateMatchdayNav();
            } else {
                // normal league - just use matchday numbers
                var matchdays = state.matchesData.matches.reduce(function (acc, m) {
                    if (m.matchday && acc.indexOf(m.matchday) === -1) {
                        acc.push(m.matchday);
                    }
                    return acc;
                }, []);
                matchdays.sort(function (a, b) { return a - b; });

                if (matchdays.length > 0) {
                    state.totalMatchdays = Math.max.apply(null, matchdays);
                } else {
                    state.totalMatchdays = 0;
                }

                // find the latest matchday that has results
                var finishedMatchdays = state.matchesData.matches
                    .filter(function (m) { return m.status === 'FINISHED'; })
                    .map(function (m) { return m.matchday; })
                    .filter(function (md) { return md !== null; });

                if (finishedMatchdays.length > 0) {
                    state.currentMatchday = Math.max.apply(null, finishedMatchdays);
                } else if (matchdays.length > 0) {
                    state.currentMatchday = matchdays[0];
                } else {
                    state.currentMatchday = 1;
                }

                updateMatchdayNav();
            }
        }

        if (!state.matchesData && !state.standingsData && !state.scorersData) {
            state.error = 'Failed to load data. Make sure the CORS proxy is running (node proxy.js).';
        }

        state.isLoading = false;
        renderContent();
    }).catch(function (err) {
        state.error = err.message || 'An unexpected error occurred.';
        state.isLoading = false;
        renderContent();
    });
}

// decides what to show based on the current tab
function renderContent() {
    if (state.isLoading) {
        contentArea.innerHTML = renderLoading();
        return;
    }

    if (state.error) {
        contentArea.innerHTML = renderError(state.error);
        return;
    }

    if (state.activeTab === 'matches') {
        contentArea.innerHTML = renderMatches();
    } else if (state.activeTab === 'standings') {
        contentArea.innerHTML = renderStandings();
    } else if (state.activeTab === 'scorers') {
        contentArea.innerHTML = renderScorers();
    }
}

function renderLoading() {
    return '<div class="loading-container">' +
        '<div class="spinner"></div>' +
        '<p class="loading-text">Fetching football data...</p>' +
        '</div>';
}

function renderError(msg) {
    return '<div class="error-container">' +
        '<div class="error-icon">⚠️</div>' +
        '<p class="error-text">' + msg + '</p>' +
        '<button class="retry-btn" onclick="loadData()">🔄 Try Again</button>' +
        '</div>';
}

function renderMatches() {
    if (!state.matchesData || !state.matchesData.matches) {
        return renderError('No match data available for this competition.');
    }

    var matches = state.matchesData.matches.slice();

    // filter by current stage/matchday page
    if (state.isMultiStage && state.matchPages.length > 0) {
        var currentPage = state.matchPages[state.currentPageIndex];
        matches = matches.filter(function (m) {
            var matchStage = m.stage || 'REGULAR_SEASON';
            return matchStage === currentPage.stage && m.matchday === currentPage.matchday;
        });
    } else if (state.currentMatchday) {
        matches = matches.filter(function (m) {
            return m.matchday === state.currentMatchday;
        });
    }

    // search filter
    if (state.searchQuery) {
        var query = state.searchQuery;
        matches = matches.filter(function (m) {
            var homeName = (m.homeTeam.name || '').toLowerCase();
            var awayName = (m.awayTeam.name || '').toLowerCase();
            var homeShort = (m.homeTeam.shortName || '').toLowerCase();
            var awayShort = (m.awayTeam.shortName || '').toLowerCase();
            return homeName.indexOf(query) !== -1 ||
                awayName.indexOf(query) !== -1 ||
                homeShort.indexOf(query) !== -1 ||
                awayShort.indexOf(query) !== -1;
        });
    }

    matches = sortMatches(matches, state.sortOption);

    if (matches.length === 0) {
        var emptyMsg = state.searchQuery
            ? 'No matches found for "' + state.searchQuery + '"'
            : 'No matches available for this matchday.';
        return '<div class="empty-state">' +
            '<div class="empty-icon">⚽</div>' +
            '<p>' + emptyMsg + '</p>' +
            '</div>';
    }

    // count how many played/live/upcoming
    var stats = matches.reduce(function (acc, m) {
        if (m.status === 'FINISHED') acc.played++;
        else if (m.status === 'IN_PLAY' || m.status === 'PAUSED') acc.live++;
        else acc.upcoming++;
        return acc;
    }, { played: 0, live: 0, upcoming: 0 });

    var statsHtml = '<div class="matchday-stats">' +
        '<span class="stat-chip finished">✅ ' + stats.played + ' Played</span>';
    if (stats.live > 0) {
        statsHtml += '<span class="stat-chip live">🔴 ' + stats.live + ' Live</span>';
    }
    if (stats.upcoming > 0) {
        statsHtml += '<span class="stat-chip upcoming">📅 ' + stats.upcoming + ' Upcoming</span>';
    }
    statsHtml += '</div>';

    // group matches by date
    var grouped = matches.reduce(function (groups, match) {
        var key = formatDate(match.utcDate);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(match);
        return groups;
    }, {});

    var groupsHtml = '';
    var dates = Object.keys(grouped);
    dates.forEach(function (date) {
        var dateMatches = grouped[date];
        var cardsHtml = dateMatches.map(function (match) {
            return renderMatchCard(match);
        }).join('');

        groupsHtml += '<div class="matchday-group fade-in">' +
            '<h3 class="matchday-title">' + date + '</h3>' +
            '<div class="matches-grid">' + cardsHtml + '</div>' +
            '</div>';
    });

    return statsHtml + groupsHtml;
}

function sortMatches(matches, option) {
    if (option === 'date-asc') {
        return matches.sort(function (a, b) {
            return new Date(a.utcDate) - new Date(b.utcDate);
        });
    } else if (option === 'date-desc') {
        return matches.sort(function (a, b) {
            return new Date(b.utcDate) - new Date(a.utcDate);
        });
    } else if (option === 'home-az') {
        return matches.sort(function (a, b) {
            return (a.homeTeam.name || '').localeCompare(b.homeTeam.name || '');
        });
    } else if (option === 'home-za') {
        return matches.sort(function (a, b) {
            return (b.homeTeam.name || '').localeCompare(a.homeTeam.name || '');
        });
    } else if (option === 'status') {
        var priority = { 'IN_PLAY': 0, 'PAUSED': 1, 'SCHEDULED': 2, 'TIMED': 2, 'FINISHED': 3 };
        return matches.sort(function (a, b) {
            var pA = priority[a.status] !== undefined ? priority[a.status] : 9;
            var pB = priority[b.status] !== undefined ? priority[b.status] : 9;
            return pA - pB;
        });
    } else {
        return matches.sort(function (a, b) {
            return new Date(a.utcDate) - new Date(b.utcDate);
        });
    }
}

function renderMatchCard(match) {
    var homeScore = null;
    var awayScore = null;
    if (match.score && match.score.fullTime) {
        homeScore = match.score.fullTime.home;
        awayScore = match.score.fullTime.away;
    }
    var isFinished = match.status === 'FINISHED';
    var isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';

    var homeCrest = match.homeTeam.crest || '';
    var awayCrest = match.awayTeam.crest || '';
    var homeShortName = match.homeTeam.shortName || match.homeTeam.name;
    var awayShortName = match.awayTeam.shortName || match.awayTeam.name;

    var scoreHtml;
    if (isFinished || isLive) {
        var h = homeScore !== null ? homeScore : '-';
        var a = awayScore !== null ? awayScore : '-';
        scoreHtml = '<span class="score">' + h + ' — ' + a + '</span>';
    } else {
        scoreHtml = '<span class="score vs">VS</span>';
    }

    return '<div class="match-card fade-in">' +
        '<div class="match-date">' +
        '<span>' + formatDate(match.utcDate) + '</span>' +
        '<span class="match-time">' + formatTime(match.utcDate) + '</span>' +
        '</div>' +
        '<div class="match-teams">' +
        '<div class="team home-team">' +
        '<img class="team-crest" src="' + homeCrest + '" alt="' + homeShortName + '" onerror="this.style.display=\'none\'">' +
        '<span class="team-name">' + homeShortName + '</span>' +
        '</div>' +
        '<div class="match-score">' +
        scoreHtml +
        '<span class="status-badge ' + getStatusClass(match.status) + '">' + getStatusLabel(match.status) + '</span>' +
        '</div>' +
        '<div class="team away-team">' +
        '<img class="team-crest" src="' + awayCrest + '" alt="' + awayShortName + '" onerror="this.style.display=\'none\'">' +
        '<span class="team-name">' + awayShortName + '</span>' +
        '</div>' +
        '</div>' +
        '</div>';
}

function renderStandings() {
    if (!state.standingsData || !state.standingsData.standings) {
        return renderError('No standings data available for this competition.');
    }

    // try to find the overall standings first
    var totalStandings = state.standingsData.standings.find(function (s) {
        return s.type === 'TOTAL';
    });

    if (!totalStandings || !totalStandings.table) {
        // if no overall table, show group tables (like in UCL)
        var groupStandings = state.standingsData.standings.filter(function (s) {
            return s.type === 'TOTAL' || s.group;
        });
        if (groupStandings.length > 0) {
            return groupStandings.map(function (gs) {
                return renderGroupTable(gs);
            }).join('');
        }
        return renderError('League table not available for this competition.');
    }

    return renderTableContent(totalStandings.table);
}

function renderGroupTable(standing) {
    var groupName = standing.group || standing.stage || 'Group';
    var formatted = groupName.replace(/_/g, ' ');

    return '<div class="group-header fade-in">' +
        '<h3 class="group-title">' + formatted + '</h3>' +
        '</div>' +
        renderTableContent(standing.table);
}

function renderTableContent(table) {
    var rows = table.slice();

    // search filter
    if (state.searchQuery) {
        var query = state.searchQuery;
        rows = rows.filter(function (row) {
            var name = (row.team.name || '').toLowerCase();
            var shortName = (row.team.shortName || '').toLowerCase();
            var tla = (row.team.tla || '').toLowerCase();
            return name.indexOf(query) !== -1 ||
                shortName.indexOf(query) !== -1 ||
                tla.indexOf(query) !== -1;
        });
    }

    rows = sortStandings(rows, state.sortOption);

    if (rows.length === 0) {
        return '<div class="empty-state"><div class="empty-icon">🔍</div><p>No teams found for "' + state.searchQuery + '"</p></div>';
    }

    // calculate some summary stats
    var summary = rows.reduce(function (acc, row) {
        acc.totalGoals = acc.totalGoals + row.goalsFor;
        acc.totalMatches = acc.totalMatches + row.playedGames;
        return acc;
    }, { totalGoals: 0, totalMatches: 0 });

    var summaryHtml = '<div class="table-summary fade-in">' +
        '<span class="summary-chip">⚽ ' + summary.totalGoals + ' Total Goals</span>' +
        '<span class="summary-chip">📊 ' + summary.totalMatches + ' Matches Played</span>' +
        '</div>';

    var rowsHtml = rows.map(function (row) {
        return renderStandingsRow(row);
    }).join('');

    return summaryHtml +
        '<div class="standings-table-wrapper fade-in">' +
        '<table class="standings-table">' +
        '<thead><tr>' +
        '<th class="pos-col">#</th>' +
        '<th class="team-col">Team</th>' +
        '<th>MP</th><th>W</th><th>D</th><th>L</th>' +
        '<th>GF</th><th>GA</th><th>GD</th>' +
        '<th class="pts-col">Pts</th>' +
        '<th class="form-col">Form</th>' +
        '</tr></thead>' +
        '<tbody>' + rowsHtml + '</tbody>' +
        '</table>' +
        '</div>';
}

function sortStandings(table, option) {
    if (option === 'points-desc') {
        return table.sort(function (a, b) { return b.points - a.points || b.goalDifference - a.goalDifference; });
    } else if (option === 'points-asc') {
        return table.sort(function (a, b) { return a.points - b.points; });
    } else if (option === 'gd-desc') {
        return table.sort(function (a, b) { return b.goalDifference - a.goalDifference; });
    } else if (option === 'gd-asc') {
        return table.sort(function (a, b) { return a.goalDifference - b.goalDifference; });
    } else if (option === 'team-az') {
        return table.sort(function (a, b) { return (a.team.name || '').localeCompare(b.team.name || ''); });
    } else if (option === 'won-desc') {
        return table.sort(function (a, b) { return b.won - a.won || b.points - a.points; });
    } else {
        return table.sort(function (a, b) { return a.position - b.position; });
    }
}

function renderStandingsRow(row) {
    var pos = row.position;
    var posClass = '';
    if (pos <= 4) posClass = 'pos-ucl';
    else if (pos <= 6) posClass = 'pos-uel';
    else if (pos >= 18) posClass = 'pos-relegation';

    // form indicators (W/D/L)
    var formHtml = '';
    if (row.form) {
        formHtml = row.form.split(',').map(function (r) {
            var cls = '';
            var title = '';
            if (r === 'W') { cls = 'form-w'; title = 'Win'; }
            else if (r === 'D') { cls = 'form-d'; title = 'Draw'; }
            else { cls = 'form-l'; title = 'Loss'; }
            return '<span class="form-dot ' + cls + '" title="' + title + '">' + r + '</span>';
        }).join('');
    }

    var crest = row.team.crest || '';
    var teamName = row.team.shortName || row.team.name;
    var gdPrefix = row.goalDifference > 0 ? '+' : '';
    var gdClass = '';
    if (row.goalDifference > 0) gdClass = 'gd-positive';
    else if (row.goalDifference < 0) gdClass = 'gd-negative';

    return '<tr class="standings-row ' + posClass + '">' +
        '<td class="pos-col"><span class="pos-badge">' + pos + '</span></td>' +
        '<td class="team-col">' +
        '<img class="table-crest" src="' + crest + '" alt="' + teamName + '" onerror="this.style.display=\'none\'">' +
        '<span>' + teamName + '</span>' +
        '</td>' +
        '<td>' + row.playedGames + '</td>' +
        '<td>' + row.won + '</td>' +
        '<td>' + row.draw + '</td>' +
        '<td>' + row.lost + '</td>' +
        '<td>' + row.goalsFor + '</td>' +
        '<td>' + row.goalsAgainst + '</td>' +
        '<td class="' + gdClass + '">' + gdPrefix + row.goalDifference + '</td>' +
        '<td class="pts-col"><strong>' + row.points + '</strong></td>' +
        '<td class="form-col">' + formHtml + '</td>' +
        '</tr>';
}

function renderScorers() {
    if (!state.scorersData || !state.scorersData.scorers) {
        return renderError('No scorer data available for this competition.');
    }

    var scorers = state.scorersData.scorers.slice();

    // search filter
    if (state.searchQuery) {
        var query = state.searchQuery;
        scorers = scorers.filter(function (s) {
            var playerName = (s.player.name || '').toLowerCase();
            var teamName = (s.team.name || '').toLowerCase();
            var teamShort = (s.team.shortName || '').toLowerCase();
            var nationality = (s.player.nationality || '').toLowerCase();
            return playerName.indexOf(query) !== -1 ||
                teamName.indexOf(query) !== -1 ||
                teamShort.indexOf(query) !== -1 ||
                nationality.indexOf(query) !== -1;
        });
    }

    scorers = sortScorers(scorers, state.sortOption);

    if (scorers.length === 0) {
        return '<div class="empty-state"><div class="empty-icon">🔍</div><p>No scorers found for "' + state.searchQuery + '"</p></div>';
    }

    var totalGoals = scorers.reduce(function (sum, s) { return sum + (s.goals || 0); }, 0);
    var totalAssists = scorers.reduce(function (sum, s) { return sum + (s.assists || 0); }, 0);

    var summaryHtml = '<div class="scorers-summary fade-in">' +
        '<span class="summary-chip">⚽ ' + totalGoals + ' Total Goals</span>' +
        '<span class="summary-chip">🅰️ ' + totalAssists + ' Total Assists</span>' +
        '<span class="summary-chip">👤 ' + scorers.length + ' Players</span>' +
        '</div>';

    var cardsHtml = scorers.map(function (s, i) {
        return renderScorerCard(s, i + 1);
    }).join('');

    return summaryHtml +
        '<div class="scorers-grid fade-in">' + cardsHtml + '</div>';
}

function sortScorers(scorers, option) {
    if (option === 'goals-desc') {
        return scorers.sort(function (a, b) { return (b.goals || 0) - (a.goals || 0); });
    } else if (option === 'goals-asc') {
        return scorers.sort(function (a, b) { return (a.goals || 0) - (b.goals || 0); });
    } else if (option === 'assists-desc') {
        return scorers.sort(function (a, b) { return (b.assists || 0) - (a.assists || 0); });
    } else if (option === 'assists-asc') {
        return scorers.sort(function (a, b) { return (a.assists || 0) - (b.assists || 0); });
    } else if (option === 'name-az') {
        return scorers.sort(function (a, b) { return (a.player.name || '').localeCompare(b.player.name || ''); });
    } else if (option === 'name-za') {
        return scorers.sort(function (a, b) { return (b.player.name || '').localeCompare(a.player.name || ''); });
    } else {
        return scorers.sort(function (a, b) { return (b.goals || 0) - (a.goals || 0); });
    }
}

function renderScorerCard(scorer, rank) {
    var medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
    var medal = medals[rank] || '';
    var nationality = scorer.player.nationality || '';
    var isTopThree = rank <= 3;
    var topClass = isTopThree ? 'top-three' : '';
    var crest = scorer.team.crest || '';
    var teamName = scorer.team.shortName || scorer.team.name;
    var goals = scorer.goals || 0;
    var assists = scorer.assists || 0;
    var played = scorer.playedMatches || 0;

    var rankHtml;
    if (medal) {
        rankHtml = '<span class="medal">' + medal + '</span>';
    } else {
        rankHtml = '<span class="rank-num">' + rank + '</span>';
    }

    var natHtml = '';
    if (nationality) {
        natHtml = '<span class="scorer-nationality">• ' + nationality + '</span>';
    }

    return '<div class="scorer-card ' + topClass + ' fade-in">' +
        '<div class="scorer-rank">' + rankHtml + '</div>' +
        '<div class="scorer-info">' +
        '<h4 class="scorer-name">' + scorer.player.name + '</h4>' +
        '<p class="scorer-team">' +
        '<img class="scorer-team-crest" src="' + crest + '" alt="' + teamName + '" onerror="this.style.display=\'none\'">' +
        teamName + ' ' + natHtml +
        '</p>' +
        '</div>' +
        '<div class="scorer-stats">' +
        '<div class="stat-item goals">' +
        '<span class="stat-value">' + goals + '</span>' +
        '<span class="stat-label">Goals</span>' +
        '</div>' +
        '<div class="stat-item assists">' +
        '<span class="stat-value">' + assists + '</span>' +
        '<span class="stat-label">Assists</span>' +
        '</div>' +
        '<div class="stat-item matches-played">' +
        '<span class="stat-value">' + played + '</span>' +
        '<span class="stat-label">Matches</span>' +
        '</div>' +
        '</div>' +
        '</div>';
}

// start everything when the page loads
document.addEventListener('DOMContentLoaded', init);
