// utils.js - helper functions and managers

// debounce so the search doesnt fire on every keystroke
function debounce(func, delay) {
    var timeoutId;
    if (!delay) delay = 400;

    return function () {
        var args = arguments;
        var context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
            func.apply(context, args);
        }, delay);
    };
}

// handles dark/light mode, saves to localStorage
var ThemeManager = {
    KEY: 'iknowball-theme',

    get: function () {
        return localStorage.getItem(this.KEY) || 'dark';
    },

    set: function (theme) {
        localStorage.setItem(this.KEY, theme);
        document.documentElement.setAttribute('data-theme', theme);
    },

    toggle: function () {
        var current = this.get();
        var next = current === 'dark' ? 'light' : 'dark';
        this.set(next);
        return next;
    },

    init: function () {
        var theme = this.get();
        document.documentElement.setAttribute('data-theme', theme);
        return theme;
    }
};

// saves favorite leagues to localStorage
var FavoritesManager = {
    KEY: 'iknowball-favorites',

    getAll: function () {
        var raw = localStorage.getItem(this.KEY);
        if (raw) {
            return JSON.parse(raw);
        }
        return [];
    },

    isFavorite: function (code) {
        return this.getAll().indexOf(code) !== -1;
    },

    toggle: function (code) {
        var favs = this.getAll();
        var index = favs.indexOf(code);
        if (index !== -1) {
            favs = favs.filter(function (c) {
                return c !== code;
            });
        } else {
            favs.push(code);
        }
        localStorage.setItem(this.KEY, JSON.stringify(favs));
        return favs.indexOf(code) !== -1;
    }
};

// formats date like "Mon, 15 Mar 2025"
function formatDate(utcDate) {
    if (!utcDate) return 'TBD';
    var d = new Date(utcDate);
    return d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// formats time like "20:00"
function formatTime(utcDate) {
    if (!utcDate) return '';
    var d = new Date(utcDate);
    return d.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// converts API status codes to readable text
function getStatusLabel(status) {
    var labels = {
        SCHEDULED: 'Scheduled',
        TIMED: 'Scheduled',
        IN_PLAY: 'Live',
        PAUSED: 'Half Time',
        FINISHED: 'Full Time',
        POSTPONED: 'Postponed',
        CANCELLED: 'Cancelled',
        SUSPENDED: 'Suspended',
        AWARDED: 'Awarded'
    };
    return labels[status] || status;
}

function getStatusClass(status) {
    if (status === 'IN_PLAY' || status === 'PAUSED') return 'status-live';
    if (status === 'FINISHED') return 'status-finished';
    return 'status-scheduled';
}
