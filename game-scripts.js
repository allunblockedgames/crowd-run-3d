// crowd-run.js
// Crowd run namespace
var cr = {};

Object.defineProperty(cr, 'SoundController', {
    get: function() {
        if (this._soundController)
            return this._soundController;
        
        this._soundController = pc.app.root.findByName('SFX').sound;
        
        return this._soundController;
    }
});

Object.defineProperty(cr, 'MusicController', {
    get: function() {
        if (this._musicController)
            return this._musicController;
        
        this._musicController = pc.app.root.findByName('Music').sound;
        
        return this._musicController;
    }
});

// famobi.js
/* jshint esversion: 6 */

/* global game state & management variables */
var game = pc.Application.getApplication();
var isPageVisible = true;
var adIsShowing = false;

/* Application extensions */

pc.Application.prototype.pauseGame = function() {
    if (this.applicationPaused)
        return;
    
    this.applicationPaused = true;
    this.soundVolumeBeforePaused = cr.SoundController.masterVolume;
    this.fire(cr.Events.SOUND_SET_MASTER_VOLUME, 0);
    this.timeScaleBeforePaused = this.timeScale;
    this.timeScale = 0;
};

pc.Application.prototype.unpauseGame = function(forced) {    
    //no need to unpause
    if (this.applicationFinished || !this.applicationPaused)
        return;
    
    if (isPageVisible && (!adIsShowing || forced)) {
        this.applicationPaused = false;
        this.fire(cr.Events.SOUND_SET_MASTER_VOLUME, this.soundVolumeBeforePaused || 1);
        this.timeScale = this.timeScaleBeforePaused;    
    } else {
        famobi.log('resuming game is not allowed now because ads are displaying or page is not visible...');
    }
};



/* global famobi entry point */
var famobi = window.famobi;


/* famobi API mock */
(function() {
    if(typeof famobi !== "undefined" || window.famobi)  {
        console.warn("Famobi API is already defined");
        return; /* famobi API is already defined */
    }
    
    window.famobi = window.famobi || {};
    window.famobi.localStorage = window.famobi.localStorage || window.localStorage;
    window.famobi.sessionStorage = window.famobi.sessionStorage || window.sessionStorage;

    window.famobi.log = window.famobi.log || console.log;
    window.famobi.openBrandingLink = window.famobi.openBrandingLink || function () {};
    window.famobi.showInterstitialAd = window.famobi.showInterstitialAd || function () { return Promise.resolve(); };
    window.famobi.hasRewardedAd = window.famobi.hasRewardedAd ||  function () { return true; }; 
    window.famobi.rewardedAd = window.famobi.rewardedAd || function (callback) { setTimeout(() => { console.log("Watching a rewarded video..."); callback({rewardGranted: true}); }, 500);};
    
    const log = (message, color = '#bada55', backgroundColor = '#222') => console.log('%c ' + message, `background: ${backgroundColor}; color: ${color}`);
    
    window.famobi.getBrandingButtonImage = () => "https://games.cdn.famobi.com/html5games/branding/spielaffe/More_Games600x253_onWhite.png";
    window.famobi.setPreloadProgress = value => log(`Progress ${value}%`, '#880000', '#FFEEEE');
    window.famobi.gameReady = value => log("gameReady() reported", "#FFFFFF", "#880000");
    window.famobi.playerReady = () => log('playerReady() reported', '#00FF66', '#000');
    window.famobi.getVolume = () => 1;
    
    window.famobi_analytics = window.famobi_analytics || {
        trackEvent: (key, obj) => {
            if(key !== "EVENT_LIVESCORE") log("trackEvent(" + key + ', ' + JSON.stringify(obj) + ")");
            return new Promise((resolve, reject) => resolve());
        },

        trackScreen: (key) => {
            log("trackScreen(" + key + ")");
        },
        
        trackStats: (key, options, amount) => {
            log("[trackStats] " + key + " x" + (amount || 1) + " " + JSON.stringify(options || ""), "#FFFFFF", "#FF00FF");
        },
    };
    
     window.famobi_tracking = window.famobi_tracking || {
        EVENTS: {
            LEVEL_START: "LEVEL_START",
            LEVEL_UPDATE: "LEVEL_UPDATE",
            LEVEL_END: "LEVEL_END"
        },
         
        init: (...args) => {
            log("Famobi tracking API initialzied ", ...args);  
        },
         
        trackEvent: (key, obj) => {
            log("famobi_tracking.trackEvent(" + key + ', ' + JSON.stringify(obj) + ")", "#000033", "#EECCFF");
            return new Promise((resolve, reject) => resolve());
        }
    };
    
    window.famobi.onRequest = (param, callback) => {
        famobi.requests = famobi.requests || {};
        famobi.requests[param] = callback;

        if(param === 'startGame') {
            console.warn('Starting game in 5500 ms...');
            setTimeout(() => callback(), 5500);
        }
    };
    
    
    window.famobi.hasFeature = function(key) {
        const options = {
            external_start: false,
            skip_title: false,
            skip_tutorial: false,
            auto_quality: false,
            forced_mode: false,
            external_mute: false,
            external_pause: false,
            external_leaderboard: false,
            copyright: true
        };
        return options[key] || false;
    };
    
    
    famobi.getFeatureProperties = function(key) {
        if(key === 'forced_mode') {
            return {
                    "state": {
                        "level": 1,
                    },
                    "override": {
                        "hide_ui": ["mission_progress"],
                    }
                };
        } else {
            return {};
        }
    };        
    
})();


/* famobi feaures shortcuts */


var getForcedModeProperties = function() {
    const forcedModePproperties =  typeof famobi !== "undefined" && famobi.getFeatureProperties("forced_mode");
    return forcedModePproperties;
};

var isExternalStart = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("external_start");
};

var isExternalMute = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("external_mute");
};

var isExternalPause = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("external_pause");
};

var skipTitleScreen = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("skip_title");
};

var skipTutorial = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("skip_tutorial");
};

var useAutoQuality = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("auto_quality");
};

var isForcedMode = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("forced_mode");
};

var isCopyrightEnabled = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("copyright");
};

var isEndlessMode = function() {
    return isForcedMode() && getForcedModeProperties().state.level === -1;
};

var hasExternalLeaderboard = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("external_leaderboard");
};

var isUIHidden = function(uiKey) {
    return isForcedMode() && getForcedModeProperties() && getForcedModeProperties().override.hide_ui && getForcedModeProperties().override.hide_ui.indexOf(uiKey) !== -1;
};



/* famobi pause/resume requests */

window.famobi_onPauseRequested = function () {
    adIsShowing = true;
    if (game) {
        game.pauseGame();
    }
};

window.famobi_onResumeRequested = function () {
    adIsShowing = false;
    if (game) {
        game.unpauseGame();
    }
};


/* Monkey App handlers */

//Monkey App handlers
if(window.famobi) {
    window.famobi.onRequest("pauseGameplay", function() {
        if (game) {
            game.pauseGame();
        }
    });
    
    window.famobi.onRequest("resumeGameplay", function() {
        if (game) {
            game.unpauseGame();
        }
    });
    
    window.famobi.onRequest("enableAudio", function() {
        if(game) {
            game.fire(cr.Events.API_ENABLE_AUDIO);
        }
    });
    
    window.famobi.onRequest("disableAudio", function() {
        if(game) {
            game.fire(cr.Events.API_DISABLE_AUDIO);
        }
    });
    
    window.famobi.onRequest("enableMusic", function() {
        if(game) {
            game.fire(cr.Events.API_ENABLE_MUSIC);
        }
    });

    window.famobi.onRequest("disableMusic", function() {
        if(game) {
            game.fire(cr.Events.API_DISABLE_MUSIC);
        }
    });
    
    window.famobi.onRequest("changeVolume", function(volume) {
        if(game) {
            game.fire(cr.Events.SOUND_SET_VOLUME_MULTIPLIER, volume);
        }
    });
}


/* Window Visibility API */
var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
    hidden = "hidden";
    visibilityChange = "visibilitychange";
} else if (typeof document["msHidden"] !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
} else if (typeof document["webkitHidden"] !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
}

function handleVisibilityChange() {
    if (document[hidden]) {
        isPageVisible = false;
        // if (game && !adIsShowing) game.pauseGame();
    } else {
        isPageVisible = true;
        if (game && !adIsShowing && game.applicationPaused && !game.applicationFinished) game.unpauseGame();
    }
}

// Warn if the browser doesn't support addEventListener or the Page Visibility API
if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
    console.log("Browser doesn't support the Page Visibility API.");
} else {
    // Handle page visibility change
    document.addEventListener(visibilityChange, handleVisibilityChange, false);
}

console.log("Window VisibilityAPI connected");


// utils.js
pc.extend(cr, function () {

    var Utils = {};
    
    Utils.RAD_TO_DEG = 57.2958;
    Utils.DEG_TO_RAD = 0.0174533;
    
    Utils.kmhToMs = function(kmh) {
        return kmh / 3.6;
    };

    Utils.msToKmh = function(ms) {
        return ms * 3.6;
    };

    Utils.getOrthogonalVectors = function(n, p, q) {
        // From the Bullet sourcebase. See btPlaneSpace1.
        // Generate two suitable orthogonal vectors to n.
        var a, k;
        if (Math.abs(n.z) > 0.7071067811865475244008443621048490) {
            // choose p in y-z plane
            a = n.y * n.y + n.z * n.z;
            k = 1 / Math.sqrt(a);
            p.x = 0;
            p.y = -n.z * k;
            p.z = n.y * k;
            // set q = n x p
            q.x = a * k;
            q.y = -n.x * p.z;
            q.z = n.x * p.y;
        } else {
            // choose p in x-y plane
            a = n.x * n.x + n.y * n.y;
            k = 1 / Math.sqrt(a);
            p.x = -n.y * k;
            p.y = n.x * k;
            p.z = 0;
            // set q = n x p
            q.x = -n.z * p.y;
            q.y = n.z * p.x;
            q.z = a * k;
        }
    };

    Utils.bound = function(num, bound) {
        return num > 0 ? Math.min(num, bound) : Math.max(num, -bound);
    };
    
    Utils.bound2 = function(num, min, max) {
        return num >= max ? max : Math.max(num, min);
    };

    Utils.isLandscape = function () {
        return pc.app.graphicsDevice.width > pc.app.graphicsDevice.height;
    };
    
    Utils.findUIScreen = function (entity) {
        var parent = entity.parent;
        
        while (!parent.screen) {
            parent = parent.parent;
        }
        
        return parent.screen;
    };

    Utils.getRandomIndex = function(array) {
        return array.length ? Math.round(Math.random() * (array.length - 1)) : -1;
    };
    
    Utils.getRandomValue = function(array) {
        return array.length ? array[Math.round(Math.random() * (array.length - 1))] : -1;
    };
    
    Utils.getRandomInt = function(a, b) {
        return Math.round(Math.random() * (b - a) + a);
    };

    Utils.getRandomNumber = function(a, b) {
        return Math.random() * (b - a) + a;
    };
    
    Utils.precisionRound = function(val, charNum) {
        var multiplier = Math.pow(10, charNum);
        
        return Math.round(val * multiplier) / multiplier;
    };
    
    Utils.isInRange = function(a, b, val) {
        return val >= a && val <= b;
    };
    
    Utils.isOutOfRange = function(a, b, val) {
        return val < a || val > b;
    };    
    
    Utils.getValues = function (obj) {
        var keys = Object.keys(obj),
            values = [];

        keys.forEach(function (key, index) {
            values.push(obj[key]);
        });

        return values;
    };

    Utils.getStorageItem = function (key, type) {
        var item = window.famobi.localStorage.getItem(key),
            parsedType,
            parsed;

        try {
            parsed = JSON.parse(item);
        } catch(e) {
            parsed = item;
        }
        
        if (!type)
            return parsed;
        
        parsedType = typeof parsed;
        
        if (parsedType == type)
            return parsed;
        else
            return null;
    };

    Utils.setStorageItem = function (key, value) {
        window.famobi.localStorage.setItem(key, JSON.stringify(value));
    };

    Utils.throwDice = function (probability) {
        var rand = Math.random();

        return rand <= probability;
    };

    Utils.wait = function (timeout) {
        return new Promise(function(res, rej) {
            setTimeout(function () {
                res();
            }, timeout);
        });
    };
    
    Utils.formatTime = function (time) {
        var sec = Math.ceil(time % 60);
        
        return Math.floor(time / 60) + ':' + (sec < 10 ? '0' : '') + sec;
    };
    
    Utils.range = function (len) {
        var x = [],
            i = 1;
        
        while(x.push(i++) < len) {}
        
        return x;
    };
    
    Utils.getAABB = function (modelEntity) {
        var aabb;
        
        modelEntity.model.meshInstances.forEach(function(meshInstance, index) {
            if (!aabb) {
                aabb = meshInstance.aabb.clone();
                return;
            }

            aabb.add(meshInstance.aabb);
        });
        
        return aabb;
    };
    
    Utils.getAABBRecursive = function (entity) {
        var aabb;
        
        if (entity.model)
            aabb = Utils.getAABB(entity);
        
        entity.children.forEach(function(child, index) {
            var childAABB = Utils.getAABBRecursive(child);
            
            if (!childAABB)
                return;
            
            if (aabb)
                aabb.add(childAABB);
            else 
                aabb = childAABB;
        });
        
        return aabb;
    };
    
    Utils.normalize = function (min, max, val) {
        return (val - min) / (max - min);
    };
    
    Utils.precision = function (num) {
        if (!isFinite(num)) return 0;
        
        var e = 1, 
            p = 0;
        
        while (Math.round(num * e) / e !== num) { e *= 10; p++; }
        
        return p;
    };
    
    return { 
        Utils: Utils
    };
    
}());

/* Delayed call implementation */
pc.Entity.prototype.delayedCall = function (durationMS, f, scope) {
    var n = 0;
    while(this["delayedExecuteTween" + n]) {
        n++;
    }
    var id = "delayedExecuteTween" + n;
    var m;
    this[id] = this.tween(m)
        .to(1, durationMS / 1000, pc.Linear)
    ;
    this[id].start();
    
    this[id].once("complete", function() {
        f.call(scope);
        this[id] = null;
    }, this);
    
    return this[id];
};

// keys.js
pc.extend(cr, function () {

    var Keys = {};
    
    Keys.STORAGE_KEYS = { CASH: 'Cash',
                          UINC: 'UInc',
                          UNUM: 'UNum',
                          CMISSION: 'CMission',
                          SOUND: 'Sound' };
    
    Keys.SCREENS = { GAME: 'Game' };
    
    Keys.GAME_STATES = { FAILED:    0,
                         PASSED:    1,
                         PAUSED:    2,
                         COUNTDOWN: 3,
                         ACTIVE:    4 };
    
    Keys.SINGLE_OBSTACLES = { BLANK: {name: 'blank', twin: false, random: false, blankAfter: false},
                              C3_C3: {name: 'c3_c3', twin: false, random: true, blankAfter: false},
                              CCC: {name: 'ccc', twin: true, random: true, blankAfter: false},
                              DISC: {name: 'disc', twin: true, random: true, blankAfter: false},
                              HUMMER: {name: 'hummer', twin: true, random: true, blankAfter: false},
                              G_ROTAION: {name: 'g_rotation', twin: true, random: true, blankAfter: false},
                              T_ROTAION: {name: 't_rotation', twin: true, random: true, blankAfter: false},
                              X_ROTAION: {name: 'x_rotation', twin: true, random: true, blankAfter: false},
                              BREAK: {name: 'break', twin: true, random: true, blankAfter: false},
                              MULTIPLIER: {name: 'multiplier', twin: false, random: true, blankAfter: true},
                              ENEMY_CROWD: {name: 'enemy_crowd', twin: false, random: true, blankAfter: true},
                              FINISH: {name: 'finish', twin: false, random: false, blankAfter: true} };
    
    Keys.WALL_OBSTACLES = { BREAK_WALL: {name: 'break_wall', twin: false, blankAfter: false, springboard: true},
                            CONE_WALL: {name: 'cone_wall', twin: false, blankAfter: false, springboard: true},
                            DISC_WALL: {name: 'disc_wall', twin: false, blankAfter: false, springboard: true} };
    
    Keys.SOUNDS = { BUTTON_CLICK: 'Button click',
                    EARN_MONEY: 'Earn money',
                    BUY: 'Buy',
                    HUMMER_HIT: 'Hummer hit',
                    JUMP: 'Jump',
                    LEVEL_WIN: 'Level win', 
                    LEVEL_FAIL: 'Level fail',
                    REVIVE: 'Revive',
                    STICKMAN_HIT_1: 'Stickman hit 1', 
                    STICKMAN_HIT_2: 'Stickman hit 2',
                    COUNTING: 'Counting' };
    
    return {
        Keys: Keys
    };
    
}());

// events.js
pc.extend(cr, function () {

    var Events = {};
    
    Events.CROWD_UPDATE = 'crowd:update';
    Events.CROWD_SPAWN = 'crowd:spawn';
    Events.CROWD_CRASH = 'crowd:crash';
    Events.CROWD_OUT = 'crowd:out';
    Events.CROWD_CLEAR = 'crowd:clear';
    Events.CROWD_JUMP = 'crowd:jump';
    
    Events.FIGHT_START = 'fight:start';
    Events.FIGHT_END = 'fight:end';
    
    Events.CAMERA_SHAKE = 'camera:shake';
    
    Events.COLLISION_BRAKE = 'collision:brake';
    
    Events.SCREEN_LOAD = 'screen:load';
    Events.SCREEN_LOADED = 'screen:load:completed';
    
    Events.GAME_PAUSE = 'game:pause';
    Events.GAME_RESUME = 'game:resume';
    Events.GAME_START = 'game:start';
    Events.GAME_OVER = 'game:over';
    Events.GAME_ENTER = 'game:enter';
    Events.GAME_REVIVE = 'game:revive';
    Events.GAME_COUNTDOWN = 'game:countdown';
    Events.GAME_RESTART = 'game:restart';
    
    Events.SOUND_SFX = 'sound:sfx';
    Events.SOUND_MUSIC = 'sound:music';
    Events.SOUND_SET_MASTER_VOLUME = 'sound:setMasterVolume';
    Events.SOUND_SET_VOLUME_MULTIPLIER = 'sound:setVolumeMultiplier';
    
    Events.API_ENABLE_AUDIO = 'api:enableAudio';
    Events.API_DISABLE_AUDIO = 'api:disableAudio';
    Events.API_ENABLE_MUSIC = 'api:enableMusic';
    Events.API_DISABLE_MUSIC = 'api:disableMusic';
    
    
    Events.Debug = {
        
    };
    
    return {
        Events: Events
    };
    
}());

// Config.js
pc.extend(cr, function () {
    
    var Config = {};

    Config.INIT_PARAMS = { AUTO_THROTTLE: true };
    
    Config.PARAMETERS = pc.extend({}, Config.INIT_PARAMS);
    
    Config.MAX_VELOCITY = 10;
    Config.TILE_SIZE = new pc.Vec2(10, 10);
    
    return {
        Config: Config
    };
    
}());

// storage.js
pc.extend(cr, function () {

    var Storage = {};
    
    Storage.gameState = cr.Keys.GAME_STATES.FAILED;
    Storage.totalCash = cr.Utils.getStorageItem(cr.Keys.STORAGE_KEYS.CASH) || 0;
    Storage.unitIncome = cr.Utils.getStorageItem(cr.Keys.STORAGE_KEYS.UINC) || 1;
    Storage.unitNumber = cr.Utils.getStorageItem(cr.Keys.STORAGE_KEYS.UNUM) || 15;
    Storage.currentMission = cr.Utils.getStorageItem(cr.Keys.STORAGE_KEYS.CMISSION) || 1;
    Storage.sound = cr.Utils.getStorageItem(cr.Keys.STORAGE_KEYS.SOUND, 'object') || {music: true, sfx: true};
    
    Storage.getVisibleScores = function() {
        return Math.floor(this.scores);
    };
    
    Storage.getVisibleDistance = function() {
        return Number(this.distance / 1000).toFixed(2);
    };
    
    Storage.getVisibleDistanceRem = function() {
        return Number(Math.abs(this.distanceRem / 1000)).toFixed(2);
    };
    
    return {
        Storage: Storage
    };
}());

Object.defineProperty(cr.Storage, "mission", {
    get: function() {
        return this._mission;
    },

    set: function(mission) {
        this._mission = mission;

        this.gameState = cr.Keys.GAME_STATES.FAILED;
        
        this._distance = 0;
        this._scores = 0;
        
        this._distanceRem = mission && mission.distance ? mission.distance * 1000 : 0;
    }
});

Object.defineProperty(cr.Storage, 'missionController', {
    get: function() {
        if (this._missionController)
            return this._missionController;
        
        this._missionController = pc.app.root.findByName('Root').script.missionController;
        
        return this._missionController;
    }
});

Object.defineProperty(cr.Storage, "crowdSize", {
    get: function() {
        return this.crowd.children.length - 1;
    }
});

Object.defineProperty(cr.Storage, "crowd", {
    get: function() {
        if (this._crowd)
            return this._crowd;
        
        this._crowd = pc.app.root.findByName('Crowd');
        
        return this._crowd;
    }
});

Object.defineProperty(cr.Storage, "acceleration", {
    get: function() {
        if (this._acceleration)
            return this._acceleration;
        
        this._acceleration = pc.app.root.findByName('Game').script.acceleration;
        
        return this._acceleration;
    }
});

Object.defineProperty(cr.Storage, "scores", {
    get: function() {
        return this._scores || 0;
    },

    set: function(scores) {
        this._scores = scores;
    }
});

Object.defineProperty(cr.Storage, "distance", {
    get: function() {
        return this._distance || 0;
    },

    set: function(distance) {
        if (this.gameState > cr.Keys.GAME_STATES.PAUSED)
            this._distance = distance;
    }
});

Object.defineProperty(cr.Storage, "distanceRem", {
    get: function() {
        return this._distanceRem || 0;
    },

    set: function(distanceRem) {
        if (this.gameState > cr.Keys.GAME_STATES.PAUSED)
            this._distanceRem = distanceRem;
    }
});

// performance-controller.js
var PerformanceController = pc.createScript('performanceController');

PerformanceController.attributes.add('minFps', {
    type: 'number',
    default: 30,
    description: 'Minimum fps to switch dpf'
});

PerformanceController.attributes.add('timeBand', {
    type: 'number',
    default: 1,
    description: 'Time frame for averaging FPS'
});

// initialize code called once per entity
PerformanceController.prototype.initialize = function() {
    //this.pixelRatioHud = this.entity.findByName('PixelRatio').element;
    //this.pixelRatioHud.text = 'PixelRatio: ' + this.app.graphicsDevice.maxPixelRatio;
    
    this.minDt = 1 / this.minFps;
    this.framesCount = 0;
    this.framesSum = 0;
};

// update code called every frame
PerformanceController.prototype.update = function(dt) {
    this.framesSum += dt;
    this.framesCount++;
        
    if (this.framesSum >= this.timeBand) {
        var frameAve;
        
        frameAve = this.framesSum / this.framesCount;
        
        if (frameAve > this.minDt) {

            this.app.graphicsDevice.maxPixelRatio = 1;
            this.enabled = false;

            //this.pixelRatioHud.text = 'PixelRatio: ' + this.app.graphicsDevice.maxPixelRatio;
            window.famobi.log("set pixel ratio to 1");
            
            return;
        }
        
        this.framesCount = 0;
        this.framesSum = 0;
    }
};

// tile-controller.js
var TileController = pc.createScript('tileController');

TileController.attributes.add('crowd', {
    type: 'entity',
    description: 'Crowd entity'
});

TileController.attributes.add('tilesRoot', {
    type: 'entity',
    description: 'Root tiles entity'
});

// initialize code called once per entity
TileController.prototype.postInitialize = function() {
    var onEnable = function () {
            this.tileRoutePos = -this.tileLength;
            this.tiles.forEach(tile => tile.destroy());
            
            this.tiles = [];
           
            for (var i = 0; i < this.TILE_NUM; i++) {
                this.createTile(this.tileLength * i, i);
            }
        }.bind(this);
    
    this.TILE_NUM = 10;
    
    this.tileTemplate = this.app.assets.find('tile', 'template');
    this.acceleration = cr.Storage.acceleration;
    this.tiles = [];
    this.tileLength = cr.Config.TILE_SIZE.y;
    this.randObjectsLen = Object.values(cr.Keys.SINGLE_OBSTACLES).filter(so => so.random).length;
    
    this.fTilePos = new pc.Vec3();
    this.tilePos = new pc.Vec3();
    
    this.on('enable', onEnable);
    
    onEnable();
};

TileController.prototype.createTile = function (tileX, index) {
    var newTile = this.tileTemplate.resource.instantiate(),
        newPos;
    
    this.tileRoutePos += this.tileLength;
    this.tiles.push(newTile);
    this.tilesRoot.addChild(newTile);
    newTile.enabled = true;

    newPos = newTile.getPosition().clone();
    newPos.x = tileX;
    newTile.rigidbody.teleport(newPos);
    newTile.script.tile.reset(!index ? cr.Keys.SINGLE_OBSTACLES.BLANK : this.getTileType(index));
};

TileController.prototype.getTileType = function (tileIndex) {
    var prevTileType = tileIndex ? this.tiles[tileIndex - 1].tileType : null,
        newType,
        tileKeys,
        randInd;
    
    if (this.tiles.find(tile => tile.tileType == cr.Keys.SINGLE_OBSTACLES.FINISH)) {
        this.twinTile = null;
        
        return cr.Keys.SINGLE_OBSTACLES.BLANK;
    } else if (this.tileRoutePos == (cr.Storage.mission.distance)) {
        this.twinTile = null;
        
        return cr.Keys.SINGLE_OBSTACLES.FINISH;
    } else if (this.twinTile) {
        newType = this.twinTile;
        this.twinTile = null;
        
        return newType;
    }
    
    if (cr.Utils.throwDice(0.2)) {
        tileKeys = Object.keys(cr.Keys.WALL_OBSTACLES);
        randInd = cr.Utils.getRandomInt(0, tileKeys.length - 1);
        newType = cr.Keys.WALL_OBSTACLES[tileKeys[randInd]];
        
        this.twinTile = null;
        return newType;
    }
    
    tileKeys = Object.keys(cr.Keys.SINGLE_OBSTACLES);
    randInd = cr.Utils.getRandomInt(0, tileKeys.length - 1);
    newType = cr.Keys.SINGLE_OBSTACLES[tileKeys[randInd]];

    if (prevTileType.blankAfter) {
        newType = cr.Keys.SINGLE_OBSTACLES.BLANK;
    } else if ((prevTileType == newType && this.randObjectsLen > 1) || !newType.random || 
               (newType == cr.Keys.SINGLE_OBSTACLES.MULTIPLIER && cr.Storage.crowdSize > 100)) {
        randInd = (randInd + 1) % tileKeys.length;
        newType = cr.Keys.SINGLE_OBSTACLES[tileKeys[randInd]];
    }
    
    if (newType.twin)
        this.twinTile = newType;

    return newType;
};

// update code called every frame
TileController.prototype.update = function(dt) {
    var crowdPos = this.crowd.getPosition(),
        firstTile = this.tiles[0],
        dS = dt * this.acceleration.velocity,
        fTilePos,
        tilePos;
    
    if (cr.Storage.gameState > cr.Keys.GAME_STATES.PAUSED) {
        cr.Storage.distance += dS;
        cr.Storage.distanceRem -= dS;
    }
    
    this.tiles.forEach(function (tile, index) {
        tilePos = this.tilePos.copy(tile.getPosition());
        tilePos.x -= dS;
        tile.rigidbody.teleport(tilePos);
    }.bind(this));
    
    fTilePos = this.fTilePos.copy(firstTile.getPosition());
    
    if (crowdPos.x > (fTilePos.x + this.tileLength * 2)) {
        this.tiles.shift().destroy();
        
        this.createTile(fTilePos.x + this.tileLength * this.TILE_NUM, this.TILE_NUM - 1);
        
        //console.log('teleport');
    }
};

// game-controller.js
var GameController = pc.createScript('gameController');

GameController.attributes.add("fader", {type: "entity"});
GameController.attributes.add("startScreen", {type: "entity"});
GameController.attributes.add("winScreen", {type: "entity"});
GameController.attributes.add("failScreen", {type: "entity"});
GameController.attributes.add("reviveScreen", {type: "entity"});
GameController.attributes.add("pauseScreen", {type: "entity"});
GameController.attributes.add("progressBar", {type: "entity"});
GameController.attributes.add("camera", {type: "entity"});

// initialize code called once per entity
GameController.prototype.initialize = function() {
    this.roadMaterials = this.app.assets.findByTag('road_material');
    this.roadPatterns = this.app.assets.findByTag('road_pattern');
    this.acceleration = cr.Storage.acceleration;
    
    var onEnable = function () {
            var roadPattern = cr.Utils.getRandomValue(this.roadPatterns);
            this.roadMaterials.forEach(function (material, index) {
                material.resource.diffuseMap = roadPattern.resource;
                material.resource.update();
            }.bind(this));
           
            this.fader.enabled = true;
            this.fader.element.opacity = 1;
            this.lastReportedLiveScore = 0;
        
            this.startScreen.enabled = false;
            this.failScreen.enabled = false;
            this.winScreen.enabled = false;
            this.reviveScreen.enabled = false;
            this.progressBar.enabled = false;
            this.pauseScreen.enabled = false;
        
            this.app.fire(cr.Events.GAME_ENTER);
            //this.app.fire(cr.Events.GAME_START);

            this.onResizeCanvas(); 
        
            // Apicontroller.trackLevelStart({"level": mission.level});        
            // window.famobi_analytics.trackEvent("EVENT_LEVELSTART", {levelName: '' + mission.level});
            // window.famobi.log('level ' + (mission.level - 1) + ' started');
            // famobi.playerReady();
            
            if (skipTitleScreen()) {
                onGameStart();
            } else {
                this.entity
                    .tween(this.fader.element)
                    .to({opacity: 0.5}, 1, pc.Linear)
                    .on('complete', function () {
                        this.startScreen.enabled = true;
                    }.bind(this))
                .start();
            }
        }.bind(this),
        
        onClick = function () {
            if (this.startScreen.enabled)
                this.app.fire(cr.Events.GAME_START);
        }.bind(this),

        onGameStart = function () {
            Apicontroller.trackLevelStart({"level": cr.Storage.currentMission});        
            window.famobi_analytics.trackEvent("EVENT_LEVELSTART", {levelName: '' + cr.Storage.currentMission});
            famobi.playerReady();
            
            cr.Storage.gameState = cr.Keys.GAME_STATES.ACTIVE;
            this.acceleration.run();

            this.startScreen.enabled = false;
            this.progressBar.enabled = true;
            
            this.entity
                .tween(this.fader.element)
                .to({opacity: 0}, 1, pc.Linear)
                .on('complete', function () {
                    this.fader.enabled = false;
                }.bind(this))
                .start();
        }.bind(this),

        onGameOver = function () {
            this.acceleration.stop(cr.Storage.gameState == cr.Keys.GAME_STATES.PASSED);

            this.fader.element.opacity = 0;
            this.fader.enabled = true;
            
            const gameScore = Math.floor(cr.Storage.distance || 0);
            
            Apicontroller.handleLevelEndEvent(cr.Storage.gameState == cr.Keys.GAME_STATES.PASSED ? "success" : "fail", gameScore, 
                () => {
                
                if (isForcedMode()) {
                    famobi.log("Level is finished in forced mode");
                    this.app.applicationPaused = true;
                    this.app.applicationFinished = true;
                } else {
                     cr.Utils.wait(2000)
                        .then(function() {
                            this.entity
                                .tween(this.fader.element)
                                .to({opacity: 0.5}, 1, pc.Linear)
                                .on('complete', function () {
                                    if (cr.Storage.gameState == cr.Keys.GAME_STATES.PASSED) {
                                        this.winScreen.enabled = true;
                                        cr.Utils.setStorageItem(cr.Keys.STORAGE_KEYS.CMISSION, ++cr.Storage.currentMission);
                                        cr.SoundController.play(cr.Keys.SOUNDS.LEVEL_WIN);
                                    } else {
                                        this.failScreen.enabled = true;
                                        cr.SoundController.play(cr.Keys.SOUNDS.LEVEL_FAIL);
                                    }
                                }.bind(this))
                                .start();
                         
                            Apicontroller.trackLevelEnd({
                                "success": cr.Storage.gameState == cr.Keys.GAME_STATES.PASSED, 
                                "score": gameScore
                            });
                    }.bind(this));
                }
            });

        }.bind(this),

        onGameRevive = function () {
            cr.Storage.gameState = cr.Keys.GAME_STATES.PAUSED;
            
            this.acceleration.stop(false);

            this.fader.element.opacity = 0;
            this.fader.enabled = true;
            
            this.entity
                .tween(this.fader.element)
                .to({opacity: 0.5}, 1, pc.Linear)
                .on('complete', function () {
                    this.reviveScreen.enabled = true;
                }.bind(this))
                .start();
        }.bind(this),

        onPause = function () {
            cr.Storage.gameState = cr.Keys.GAME_STATES.PAUSED;
            
            this.app.timeScale = 0;
            
            this.progressBar.enabled = false;
            this.pauseScreen.enabled = true;
            this.fader.enabled = true;
            this.fader.element.opacity = 0.5;
        }.bind(this),

        onResume = function () {
            cr.Storage.gameState = cr.Keys.GAME_STATES.ACTIVE;
            
            this.acceleration.run(true);
            
            this.app.timeScale = 1;

            this.progressBar.enabled = true;
            this.reviveScreen.enabled = false;
            this.pauseScreen.enabled = false;
            
            this.entity
                .tween(this.fader.element)
                .to({opacity: 0}, 1, pc.Linear)
                .on('complete', function () {
                    this.fader.enabled = false;
                }.bind(this))
                .start();
        }.bind(this),
        
        onGameRestart = function () {
            this.app.fire(cr.Events.CROWD_CLEAR);
            
            this.app.timeScale = 1;
            
            setMission();
            
            this.entity.enabled = false;
            this.entity.enabled = true;
        }.bind(this),

        onCountdown = function () {
            cr.Storage.gameState = cr.Keys.GAME_STATES.COUNTDOWN;
        }.bind(this),
    
        setMission = function () {
            cr.Storage.mission = { distance: 40 + cr.Storage.currentMission * 10 };
        }.bind(this);

    this.app.on(cr.Events.GAME_PAUSE, onPause);
    this.app.on(cr.Events.GAME_RESUME, onResume);
    this.app.on(cr.Events.GAME_START, onGameStart);
    this.app.on(cr.Events.GAME_OVER, onGameOver);
    this.app.on(cr.Events.GAME_RESTART, onGameRestart);
    this.app.on(cr.Events.GAME_REVIVE, onGameRevive);
    this.app.on(cr.Events.GAME_COUNTDOWN, onCountdown);
    this.app.graphicsDevice.on('resizecanvas', this.onResizeCanvas, this);
    this.fader.element.on('click', onClick);
    this.on('enable', onEnable);
    
    this.on('destroy', function () {
       
    }.bind(this));
    
    setMission();
    onEnable();
};

GameController.prototype.onResizeCanvas = function () {
    
};

// update code called every frame
GameController.prototype.update = function(dt) {
    if (Math.floor(cr.Storage.distance) != this.lastReportedLiveScore) {
        this.lastReportedLiveScore = Math.floor(cr.Storage.distance);
        window.famobi_analytics.trackEvent("EVENT_LIVESCORE", {liveScore: this.lastReportedLiveScore});
    }
};

// fps.js
var Fps = pc.createScript('fps');

// Just add this script to any object in the scene (usually Root) and it will 
// appear in the app as HTML overlay

if (typeof(document) !== "undefined") {
    /*! FPSMeter 0.3.1 - 9th May 2013 | https://github.com/Darsain/fpsmeter */
    (function(m,j){function s(a,e){for(var g in e)try{a.style[g]=e[g]}catch(j){}return a}function H(a){return null==a?String(a):"object"===typeof a||"function"===typeof a?Object.prototype.toString.call(a).match(/\s([a-z]+)/i)[1].toLowerCase()||"object":typeof a}function R(a,e){if("array"!==H(e))return-1;if(e.indexOf)return e.indexOf(a);for(var g=0,j=e.length;g<j;g++)if(e[g]===a)return g;return-1}function I(){var a=arguments,e;for(e in a[1])if(a[1].hasOwnProperty(e))switch(H(a[1][e])){case "object":a[0][e]=
    I({},a[0][e],a[1][e]);break;case "array":a[0][e]=a[1][e].slice(0);break;default:a[0][e]=a[1][e]}return 2<a.length?I.apply(null,[a[0]].concat(Array.prototype.slice.call(a,2))):a[0]}function N(a){a=Math.round(255*a).toString(16);return 1===a.length?"0"+a:a}function S(a,e,g,j){if(a.addEventListener)a[j?"removeEventListener":"addEventListener"](e,g,!1);else if(a.attachEvent)a[j?"detachEvent":"attachEvent"]("on"+e,g)}function D(a,e){function g(a,b,d,c){return y[0|a][Math.round(Math.min((b-d)/(c-d)*J,J))]}
    function r(){f.legend.fps!==q&&(f.legend.fps=q,f.legend[T]=q?"FPS":"ms");K=q?b.fps:b.duration;f.count[T]=999<K?"999+":K.toFixed(99<K?0:d.decimals)}function m(){z=A();L<z-d.threshold&&(b.fps-=b.fps/Math.max(1,60*d.smoothing/d.interval),b.duration=1E3/b.fps);for(c=d.history;c--;)E[c]=0===c?b.fps:E[c-1],F[c]=0===c?b.duration:F[c-1];r();if(d.heat){if(w.length)for(c=w.length;c--;)w[c].el.style[h[w[c].name].heatOn]=q?g(h[w[c].name].heatmap,b.fps,0,d.maxFps):g(h[w[c].name].heatmap,b.duration,d.threshold,
    0);if(f.graph&&h.column.heatOn)for(c=u.length;c--;)u[c].style[h.column.heatOn]=q?g(h.column.heatmap,E[c],0,d.maxFps):g(h.column.heatmap,F[c],d.threshold,0)}if(f.graph)for(p=0;p<d.history;p++)u[p].style.height=(q?E[p]?Math.round(O/d.maxFps*Math.min(E[p],d.maxFps)):0:F[p]?Math.round(O/d.threshold*Math.min(F[p],d.threshold)):0)+"px"}function k(){20>d.interval?(x=M(k),m()):(x=setTimeout(k,d.interval),P=M(m))}function G(a){a=a||window.event;a.preventDefault?(a.preventDefault(),a.stopPropagation()):(a.returnValue=
    !1,a.cancelBubble=!0);b.toggle()}function U(){d.toggleOn&&S(f.container,d.toggleOn,G,1);a.removeChild(f.container)}function V(){f.container&&U();h=D.theme[d.theme];y=h.compiledHeatmaps||[];if(!y.length&&h.heatmaps.length){for(p=0;p<h.heatmaps.length;p++){y[p]=[];for(c=0;c<=J;c++){var b=y[p],e=c,g;g=0.33/J*c;var j=h.heatmaps[p].saturation,m=h.heatmaps[p].lightness,n=void 0,k=void 0,l=void 0,t=l=void 0,v=n=k=void 0,v=void 0,l=0.5>=m?m*(1+j):m+j-m*j;0===l?g="#000":(t=2*m-l,k=(l-t)/l,g*=6,n=Math.floor(g),
    v=g-n,v*=l*k,0===n||6===n?(n=l,k=t+v,l=t):1===n?(n=l-v,k=l,l=t):2===n?(n=t,k=l,l=t+v):3===n?(n=t,k=l-v):4===n?(n=t+v,k=t):(n=l,k=t,l-=v),g="#"+N(n)+N(k)+N(l));b[e]=g}}h.compiledHeatmaps=y}f.container=s(document.createElement("div"),h.container);f.count=f.container.appendChild(s(document.createElement("div"),h.count));f.legend=f.container.appendChild(s(document.createElement("div"),h.legend));f.graph=d.graph?f.container.appendChild(s(document.createElement("div"),h.graph)):0;w.length=0;for(var q in f)f[q]&&
    h[q].heatOn&&w.push({name:q,el:f[q]});u.length=0;if(f.graph){f.graph.style.width=d.history*h.column.width+(d.history-1)*h.column.spacing+"px";for(c=0;c<d.history;c++)u[c]=f.graph.appendChild(s(document.createElement("div"),h.column)),u[c].style.position="absolute",u[c].style.bottom=0,u[c].style.right=c*h.column.width+c*h.column.spacing+"px",u[c].style.width=h.column.width+"px",u[c].style.height="0px"}s(f.container,d);r();a.appendChild(f.container);f.graph&&(O=f.graph.clientHeight);d.toggleOn&&("click"===
    d.toggleOn&&(f.container.style.cursor="pointer"),S(f.container,d.toggleOn,G))}"object"===H(a)&&a.nodeType===j&&(e=a,a=document.body);a||(a=document.body);var b=this,d=I({},D.defaults,e||{}),f={},u=[],h,y,J=100,w=[],W=0,B=d.threshold,Q=0,L=A()-B,z,E=[],F=[],x,P,q="fps"===d.show,O,K,c,p;b.options=d;b.fps=0;b.duration=0;b.isPaused=0;b.tickStart=function(){Q=A()};b.tick=function(){z=A();W=z-L;B+=(W-B)/d.smoothing;b.fps=1E3/B;b.duration=Q<L?B:z-Q;L=z};b.pause=function(){x&&(b.isPaused=1,clearTimeout(x),
    C(x),C(P),x=P=0);return b};b.resume=function(){x||(b.isPaused=0,k());return b};b.set=function(a,c){d[a]=c;q="fps"===d.show;-1!==R(a,X)&&V();-1!==R(a,Y)&&s(f.container,d);return b};b.showDuration=function(){b.set("show","ms");return b};b.showFps=function(){b.set("show","fps");return b};b.toggle=function(){b.set("show",q?"ms":"fps");return b};b.hide=function(){b.pause();f.container.style.display="none";return b};b.show=function(){b.resume();f.container.style.display="block";return b};b.destroy=function(){b.pause();
    U();b.tick=b.tickStart=function(){}};V();k()}var A,r=m.performance;A=r&&(r.now||r.webkitNow)?r[r.now?"now":"webkitNow"].bind(r):function(){return+new Date};for(var C=m.cancelAnimationFrame||m.cancelRequestAnimationFrame,M=m.requestAnimationFrame,r=["moz","webkit","o"],G=0,k=0,Z=r.length;k<Z&&!C;++k)M=(C=m[r[k]+"CancelAnimationFrame"]||m[r[k]+"CancelRequestAnimationFrame"])&&m[r[k]+"RequestAnimationFrame"];C||(M=function(a){var e=A(),g=Math.max(0,16-(e-G));G=e+g;return m.setTimeout(function(){a(e+
    g)},g)},C=function(a){clearTimeout(a)});var T="string"===H(document.createElement("div").textContent)?"textContent":"innerText";D.extend=I;window.FPSMeter=D;D.defaults={interval:100,smoothing:10,show:"fps",toggleOn:"click",decimals:1,maxFps:60,threshold:100,position:"absolute",zIndex:10,left:"5px",top:"5px",right:"auto",bottom:"auto",margin:"0 0 0 0",theme:"dark",heat:0,graph:0,history:20};var X=["toggleOn","theme","heat","graph","history"],Y="position zIndex left top right bottom margin".split(" ")})(window);(function(m,j){j.theme={};var s=j.theme.base={heatmaps:[],container:{heatOn:null,heatmap:null,padding:"5px",minWidth:"95px",height:"30px",lineHeight:"30px",textAlign:"right",textShadow:"none"},count:{heatOn:null,heatmap:null,position:"absolute",top:0,right:0,padding:"5px 10px",height:"30px",fontSize:"24px",fontFamily:"Consolas, Andale Mono, monospace",zIndex:2},legend:{heatOn:null,heatmap:null,position:"absolute",top:0,left:0,padding:"5px 10px",height:"30px",fontSize:"12px",lineHeight:"32px",fontFamily:"sans-serif",
    textAlign:"left",zIndex:2},graph:{heatOn:null,heatmap:null,position:"relative",boxSizing:"padding-box",MozBoxSizing:"padding-box",height:"100%",zIndex:1},column:{width:4,spacing:1,heatOn:null,heatmap:null}};j.theme.dark=j.extend({},s,{heatmaps:[{saturation:0.8,lightness:0.8}],container:{background:"#222",color:"#fff",border:"1px solid #1a1a1a",textShadow:"1px 1px 0 #222"},count:{heatOn:"color"},column:{background:"#3f3f3f"}});j.theme.light=j.extend({},s,{heatmaps:[{saturation:0.5,lightness:0.5}],
    container:{color:"#666",background:"#fff",textShadow:"1px 1px 0 rgba(255,255,255,.5), -1px -1px 0 rgba(255,255,255,.5)",boxShadow:"0 0 0 1px rgba(0,0,0,.1)"},count:{heatOn:"color"},column:{background:"#eaeaea"}});j.theme.colorful=j.extend({},s,{heatmaps:[{saturation:0.5,lightness:0.6}],container:{heatOn:"backgroundColor",background:"#888",color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,.2)",boxShadow:"0 0 0 1px rgba(0,0,0,.1)"},column:{background:"#777",backgroundColor:"rgba(0,0,0,.2)"}});j.theme.transparent=
    j.extend({},s,{heatmaps:[{saturation:0.8,lightness:0.5}],container:{padding:0,color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,.5)"},count:{padding:"0 5px",height:"40px",lineHeight:"40px"},legend:{padding:"0 5px",height:"40px",lineHeight:"42px"},graph:{height:"40px"},column:{width:5,background:"#999",heatOn:"backgroundColor",opacity:0.5}})})(window,FPSMeter);    
}

// initialize code called once per entity
Fps.prototype.initialize = function() {
    var urlParams = new URLSearchParams(window.location.search),
        fpsEnabled = urlParams.get('fps');
    
    //if (fpsEnabled === 'true')
        this.fps = new FPSMeter({heat: true, graph: true});
    //else
    //    this.enabled = false;
};

// update code called every frame
Fps.prototype.update = function(dt) {
    this.fps.tick();
};

// animate-number.js
var AnimateNumber = pc.createScript('animateNumber');

AnimateNumber.attributes.add('playSound', {
    type: 'boolean',
    default: false
});

AnimateNumber.attributes.add('duration', {
    type: 'number',
    default: 1
});

AnimateNumber.attributes.add('prefix', {
    type: 'string',
    default: ''
});

AnimateNumber.attributes.add('postfix', {
    type: 'string',
    default: ''
});

// initialize code called once per entity
AnimateNumber.prototype.initialize = function() {
    
};

AnimateNumber.prototype._numberToText = function(number) {
    this.entity.element.text = this.prefix + number.toFixed(this.precision) + this.postfix;
};

AnimateNumber.prototype.set = function(num, reset) {
    if (reset) {
        this.displayedNum = 0;
        this._numberToText(0);
    }
    
    num = Number.parseFloat(num);
    
    this.numberTotal = num;
    this.displayedNum = this.displayedNum || 0;
    this.precision = cr.Utils.precision(num);
    this._numberToText(this.displayedNum);
    this.calcStep(num);
    
    if (this.playSound)
        cr.SoundController.play(cr.Keys.SOUNDS.EARN_MONEY);
};

AnimateNumber.prototype.calcStep = function(num) {
    this.step = (num - this.displayedNum) / (this.duration * 60);
};

// update code called every frame
AnimateNumber.prototype.update = function(dt) {
    if (this.displayedNum == this.numberTotal)
        return;
    
    if (Math.abs(this.step) > Math.abs(this.displayedNum - this.numberTotal))
        this.displayedNum = this.numberTotal;
    else
        this.displayedNum += this.step;
    
    this._numberToText(this.displayedNum);
};

// elastic-scale-out.js
var ElasticScaleOut = pc.createScript('elasticScaleOut');

ElasticScaleOut.attributes.add('time', {
    type: 'number',
    default: 0.8,
    description: 'Animation time'
});

ElasticScaleOut.attributes.add('delay', {
    type: 'number',
    default: 0,
    description: 'Start delay'
});

ElasticScaleOut.attributes.add('ignoreTimescale', {
    type: 'boolean',
    default: true,
    description: 'Ignore app timescale'
});

// initialize code called once per entity
ElasticScaleOut.prototype.initialize = function() {
    this.FRAME_TIME = 1 / 60;
    
    var onEnable = function () {
        var scaleObj = {x: 0, y: 0, z: 0};
        
        this.entity.setLocalScale(0.1, 0.1, 0.1);
        
        this.animation = this.entity
            .tween(scaleObj)
            .to({x: 1, y: 1, z: 1}, this.time, pc.ElasticOut)
            .on('update', function () {
                this.entity.setLocalScale(scaleObj.x, scaleObj.y, scaleObj.z);
            }.bind(this))
            .delay(this.delay)
            .start();
    }.bind(this);
    
    this.on("enable", onEnable);
    
    onEnable();
};

// update code called every frame
ElasticScaleOut.prototype.update = function(dt) {
    if (!this.animation.complete && this.ignoreTimescale)
        this.animation.update(this.FRAME_TIME - (this.FRAME_TIME * this.app.timeScale));
};

// animate-scale.js
var AnimateScale = pc.createScript('animateScale');

AnimateScale.attributes.add("offsetCurve", {type: "curve", title: "Offset Curve", curves: [ 'x', 'y', 'z' ]});
AnimateScale.attributes.add("duration", {type: "number", default: 3, title: "Duration (secs)"});
AnimateScale.attributes.add('loop', {
    title: 'Loop animation',
    type: 'boolean',
    default: false
});
AnimateScale.attributes.add('autoPlay', {
    title: 'Auto play',
    type: 'boolean',
    default: false
});
AnimateScale.attributes.add('ignoreTimeScale', {
    title: 'Ignore time scale',
    type: 'boolean',
    default: false
});

// initialize code called once per entity
AnimateScale.prototype.initialize = function() {
    // Store the original scale of the entity so we can offset from it
    this.startScale = this.entity.getLocalScale().clone();
    
    // Keep track of the current scale
    this.scale = new pc.Vec3();
    
    if (!this.autoPlay)
        this.enabled = false;
    else 
        this.play();
};

AnimateScale.prototype.play = function() {
    if (!this.startScale)
        this.autoPlay = true;
    
    this.time = 0;
    this.isPlaying = true;
    this.enabled = true;
};

AnimateScale.prototype.stop = function() {
    if (!this.isPlaying)
        return;
    
    this.time = 0;
    this.updateAnimation();
    this.enabled = false;
    this.isPlaying = false;
};

AnimateScale.prototype.updateAnimation = function() {
    var percent = this.time / this.duration;
    
    // Get curve values using current time relative to duration (percent)
    // The offsetCurve has 3 curves (x, y, z) so the returned value will be a set of 
    // 3 values
    this.curveValue = this.offsetCurve.value(percent);
    
    // Create our new position from the startScale and curveValue
    this.scale.copy(this.startScale);
    this.scale.x = this.curveValue[0];
    this.scale.y = this.curveValue[1];
    this.scale.z = this.curveValue[2];
    
    this.entity.setLocalScale(this.scale);
};
 
AnimateScale.prototype.update = function(dt) {
    this.time += this.ignoreTimeScale ? 0.016 : dt;
    
    // Loop the animation forever
    if (this.loop && this.time > this.duration) {
        this.time -= this.duration;
    } else if (!this.loop && this.time > this.duration) {
        this.enabled = false;
    }
    
    // Calculate how far in time we are for the animation
    this.updateAnimation();
};


// animate-rotation.js
var AnimateRotation = pc.createScript('animateRotation');

AnimateRotation.attributes.add('axle', {
    type: 'string',
    title: 'Rotation axle',
    enum: [
        { 'x': 'x' },
        { 'y': 'y' },
        { 'z': 'z' }
    ]
});

AnimateRotation.attributes.add('rotationSpeed', {
    type: 'number',
    title: 'Rotation speed',
    default: 0.5
});

AnimateRotation.attributes.add('preserveAngles', {
    type: 'boolean',
    default: false
});

AnimateRotation.attributes.add('teleport', {
    type: 'boolean',
    default: false
});

// initialize code called once per entity
AnimateRotation.prototype.initialize = function() {
    if (this.preserveAngles)
        this.angles = this.entity.getLocalEulerAngles().clone();
    else
        this.angles = { x: 0,
                        y: 0,
                        z: 0 };
};

// update code called every frame
AnimateRotation.prototype.update = function(dt) {
    var rotationSpeed = dt / 0.0167 * this.rotationSpeed,
        quat;
    
    this.angles[this.axle] = (this.angles[this.axle] - rotationSpeed) % 360;
    
    quat = new pc.Quat().setFromEulerAngles(this.angles.x, this.angles.y, this.angles.z);
    
    if (this.teleport)
        this.entity.rigidbody.teleport(this.entity.getPosition(), quat);
    else
        this.entity.setLocalRotation(quat);
};


// animate-position.js
var AnimatePosition = pc.createScript('animatePosition');

// Example of creating curve attribute with multiple curves (in this case, x, y, z)
AnimatePosition.attributes.add("offsetCurve", {type: "curve", title: "Offset Curve", curves: [ 'x', 'y', 'z' ]});
AnimatePosition.attributes.add("duration", {type: "number", default: 3, title: "Duration (secs)"});


// initialize code called once per entity
AnimatePosition.prototype.initialize = function() {
    // Store the original position of the entity so we can offset from it
    this.startPosition = this.entity.getLocalPosition().clone();
    
    // Keep track of the current position
    this.position = new pc.Vec3();
    
    this.time = 0;
};


// update code called every frame
AnimatePosition.prototype.update = function(dt) {
    this.time += dt;
    
    // Loop the animation forever
    if (this.time > this.duration) {
        this.time -= this.duration;
    }
    
    // Calculate how far in time we are for the animation
    this.percent = this.time / this.duration;
    
    // Get curve values using current time relative to duration (percent)
    // The offsetCurve has 3 curves (x, y, z) so the returned value will be a set of 
    // 3 values
    this.curveValue = this.offsetCurve.value(this.percent);
    
    // Create our new position from the startPosition and curveValue
    this.position.copy(this.startPosition);
    this.position.x += this.curveValue[0];
    this.position.y += this.curveValue[1];
    this.position.z += this.curveValue[2];
    
    this.entity.setLocalPosition(this.position);
};


// acceleration.js
var Acceleration = pc.createScript('acceleration');

Acceleration.attributes.add('camera', {
    type: 'entity',
    description: 'Assign a camera entity'
});

Acceleration.attributes.add('crowd', {
    type: 'entity',
    description: 'The crowd'
});

Acceleration.attributes.add('power', {
    type: 'number',
    description: 'The power'
});

// initialize code called once per entity
Acceleration.prototype.initialize = function() {
    this.DAMPING = 0.9;
    this.DAMPING_EASE = 0.96;
    
    var onCollision = function (e) {
            
        }.bind(this),
        
        onEnable = function() {
            this.damping = this.DAMPING;
            this.maxSpeed = cr.Config.MAX_VELOCITY;
            this.velocity = 0;
            this.stop();
        }.bind(this),
        
        onDisable = function() {
            this.stop();
        }.bind(this),
    
        onGameStart = function() {
            
        }.bind(this),
        
        onFightStart = function (event) {
            this.maxSpeed = cr.Config.MAX_VELOCITY / 8; //3
        }.bind(this),
        
        onFightEnd = function (event) {
            this.maxSpeed = cr.Config.MAX_VELOCITY;
        }.bind(this);
    
    this.on('enable', onEnable);
    this.on('disable', onDisable);
    
    this.app.on(cr.Events.GAME_START, onGameStart);
    this.app.on(cr.Events.FIGHT_START, onFightStart);
    this.app.on(cr.Events.FIGHT_END, onFightEnd);
    
    onEnable();
};

Acceleration.prototype.doCollisionBrake = function(normal, other) {
    var vLoss,
        vNew;
    
    if (Math.abs(normal.x) >= 0.5 && other.dynamics)
        vNew = Math.max(0, this.velocity - Math.abs(other.dynamics.linearVelocity.x - 2));
    else
        vNew = Math.max(0, this.velocity - this.VELOCITY_LOSS);
    
    vLoss = this.velocity - vNew;

    this.velocity = vNew;
    this.app.fire(cr.Events.COLLISION_BRAKE, vLoss);
};

Acceleration.prototype.run = function(instant) {
    this.running = true;
    this.velocity = instant ? this.maxSpeed : 0;
};

Acceleration.prototype.isRunning = function() {
    return this.running;
};

Acceleration.prototype.stop = function(ease) {
    this.running = false;
    this.damping = ease ? this.DAMPING_EASE : this.DAMPING;
};

Acceleration.prototype.update = function(dt) {
    var forward = this.camera.forward,
        x = 0,
        app = this.app,
        accelDamping,
        power;
    
    if ((app.keyboard.isPressed(pc.KEY_UP) || cr.Config.PARAMETERS.AUTO_THROTTLE) && 
        this.velocity < this.maxSpeed && this.running)
        x += forward.x;
    
    power = this.power;
    
    if (x) {
        accelDamping = x < 0 ? 1 : (1 - this.velocity / this.maxSpeed);
        this.velocity += x * power * dt * accelDamping;
    } else {
        this.velocity *= this.damping;
    }
};

// handling.js
var Handling = pc.createScript('handling');

Handling.attributes.add('camera', {
    type: 'entity',
    description: 'Assign a camera entity'
});

Handling.attributes.add('power', {
    type: 'number'
});

// initialize code called once per entity
Handling.prototype.initialize = function() {
    this.SENSITIVITY = 0.05;
    this.KEYB_SENSITIVITY = 200;
    this.FIGHT_SENSITIVITY = 0.06;
    this.BOUNDS = 5;
    this.CAMERA_BOUNDS = 2;
    
    var onEnable = function () {
            this.enemy = null;
            this.entity.setPosition(0, 0, 0);
        }.bind(this),
        
        onTouchStart = function (event) {
            setTouchPos(event.touches[0]);

            // Needs to be called to remove 300ms delay and stop 
            // browsers consuming the event for something else
            // such as zooming in
            event.event.preventDefault();
        }.bind(this),

        onTouchMove = function (event) {
            this.updateTouchPos(event.touches[0]);
            
            event.event.preventDefault();
        }.bind(this),

        onTouchEnd = function (event) {
            this.stopHandling();

            event.event.preventDefault();
        }.bind(this),

        onTouchCancel = function (event) {
            this.stopHandling();

            event.event.preventDefault();
        }.bind(this),
        
        onMouseDown = function (event) {
            setTouchPos(event);
        }.bind(this),
        
        onMouseUp = function (event) {
            this.stopHandling();
        }.bind(this),
        
        onMouseMove = function (event) {
            if (event.buttons[pc.MOUSEBUTTON_LEFT])
                this.updateTouchPos(event);
        }.bind(this),
        
        onFightStart = function (enemyCrowd) {
            this.enemy = enemyCrowd;
        }.bind(this),
        
        onFightEnd = function (event) {
            this.enemy = null;
        }.bind(this),
        
        setTouchPos = function (pos) {
            this.screenPos = pos;
            this.lastScreenPos = this.screenPos;
        }.bind(this),
    
        touch = this.app.touch,
        mouse = this.app.mouse;
    
    if (touch) {
        touch.on(pc.EVENT_TOUCHSTART, onTouchStart, this);
        touch.on(pc.EVENT_TOUCHMOVE, onTouchMove, this);
        touch.on(pc.EVENT_TOUCHEND, onTouchEnd, this);
        touch.on(pc.EVENT_TOUCHCANCEL, onTouchCancel, this);
    } else {
        mouse.on(pc.EVENT_MOUSEDOWN, onMouseDown, this);
        mouse.on(pc.EVENT_MOUSEUP, onMouseUp, this);
        mouse.on(pc.EVENT_MOUSEMOVE, onMouseMove, this);
    }
    
    this.vS = new pc.Vec3();
    this.cEul = new pc.Vec3(0, 0, 0);
    
    this.app.on(cr.Events.FIGHT_START, onFightStart);
    this.app.on(cr.Events.FIGHT_END, onFightEnd);
    
    this.on('enable', onEnable);
    
    this.on('destroy', function () {
        
    }.bind(this));
    
    onEnable();
};

Handling.prototype.updateTouchPos = function (pos) {
    var entityPos = this.entity.getPosition();
    
    this.screenPos = pos;
    
    this.vS.set(0, 0, this.screenPos.x - this.lastScreenPos.x);
    
    this.lastScreenPos = this.screenPos;
};

Handling.prototype.handle = function (vS) {
    vS.y = 0;
    
    if (cr.Storage.gameState != cr.Keys.GAME_STATES.ACTIVE || !vS.length())
        return;
    
    var entityPos = this.entity.getPosition(),
        aabb = cr.Utils.getAABBRecursive(this.entity),
        eulY;
        
    if (!aabb)
        return;
    
    vS.mulScalar(this.SENSITIVITY);
    
    vS.z = cr.Utils.bound2(vS.z, -this.BOUNDS - entityPos.z + aabb.halfExtents.z, this.BOUNDS - entityPos.z - aabb.halfExtents.z);
        
    this.entity.translate(vS);

    if (this.enemy)
        eulY = Math.acos(vS.x / vS.length()) * cr.Utils.RAD_TO_DEG * (vS.z > 0 ? -1 : 1);
    else
        eulY = 0;

    this.updateChildren(eulY);
};

Handling.prototype.updateChildren = function (eulY) {
    this.entity.children.forEach((child, index) => {
        if (!child.rigidbody)
            return;
        
        this.cEul.set(0, eulY, 0);
        
        child.rigidbody.teleport(child.getPosition(), this.cEul);
    });
};

Handling.prototype.stopHandling = function () {
    this.lastScreenPos = this.screenPos;
};

Handling.prototype.update = function(dt) {
    var centerPos = this.entity.getPosition(),
        right = this.camera.right,
        dX = centerPos.x * -1 * dt / this.FIGHT_SENSITIVITY,
        x = 0,
        cameraPos = this.camera.getPosition(),
        enemyStickman;
    
    if (this.enemy) {
        enemyStickman = this.enemy.stickmans.find(s => !s.script.enemyStickman.crashed);
        
        if (enemyStickman)
            this.vS.copy(enemyStickman.getPosition()).sub(centerPos).mulScalar(dt / this.FIGHT_SENSITIVITY);
    } else {
        if (this.app.keyboard.isPressed(pc.KEY_LEFT))
            this.vS.set(dX, 0, -this.KEYB_SENSITIVITY * dt);
        else if (this.app.keyboard.isPressed(pc.KEY_RIGHT))
            this.vS.set(dX, 0, this.KEYB_SENSITIVITY * dt);
        else if (Math.abs(centerPos.x) > 0.01)
            this.vS.x = dX;
        else if (this.cEul.y)
            this.updateChildren(0);
    }
    
    this.handle(this.vS);
    this.vS.set(0, 0, 0);
    
    if (centerPos.z > cameraPos.z && cameraPos.z < this.CAMERA_BOUNDS)
        x = right.z * cr.Utils.normalize(0, 5, Math.abs(centerPos.z - cameraPos.z));
    else if (centerPos.z < cameraPos.z && cameraPos.z > -this.CAMERA_BOUNDS)
        x = -right.z * cr.Utils.normalize(0, 5, Math.abs(centerPos.z - cameraPos.z));
    
    this.camera.rigidbody.applyForce(0, 0, this.power * x);
};

// crowd.js
var Crowd = pc.createScript('crowd');

Crowd.attributes.add('camera', {
    type: 'entity',
    description: 'Assign a camera entity'
});

Crowd.attributes.add('centripetalPower', {
    type: 'number',
    default: 10,
    description: 'Centripetal power'
});

// initialize code called once per entity
Crowd.prototype.postInitialize = function() {
    var onCrash = function (crashed) {
            this.countControl.fire(cr.Events.CROWD_UPDATE, --this.aliveStickmans);

            if (!this.aliveStickmans && (this.revived || !Apicontroller.hasRewardedVideo())) {
                cr.Storage.gameState = cr.Keys.GAME_STATES.FAILED;
                
                this.app.fire(cr.Events.GAME_OVER);
            } else if (!this.aliveStickmans && Apicontroller.hasRewardedVideo()) {
                this.revived = true;
                this.app.fire(cr.Events.GAME_REVIVE);
            }
        }.bind(this),
        
        onEnable = function () {
            this.aliveStickmans = 0;
            this.stickmans = [];
            this.aabb = null;
            this.revived = false;

            this.centripetalForce = new pc.Vec3();
            this.centerPos = new pc.Vec3();
            this.countControl = this.entity.findByTag('count-control')[0];

            this.stickmanTemplate = this.app.assets.find('Stickman', 'template');

            this.spawnCount = cr.Storage.unitNumber;
        }.bind(this),
        
        onClear = function () {
            this.stickmans.forEach(stickman => stickman.destroy());
        }.bind(this);
    
    this.SPAWN_MAX = 50; // do not spawn more than 272 units in one frame
    this.WAIT_FRAMES = 2;
    
    this.spawnCount = 0;
    this.waitF = 0;
    
    this.stickmans = [];
    
    this.entity.on(cr.Events.CROWD_CRASH, onCrash);
    this.app.on(cr.Events.CROWD_CLEAR, onClear);
    this.app.on(cr.Events.CROWD_SPAWN, this.onCrowdSpawn, this);
    // this.app.on(cr.Events.CROWD_OUT, this.onCrowdOut, this);
    this.app.on(cr.Events.CROWD_JUMP, this.onCrowdJump, this);
    
    this.on('enable', onEnable);
    
    onEnable();
};

// Crowd.prototype.onCrowdOut = function (e) {
//     e.rigidbody.teleport(this.getSpawnSosition());
// };

Crowd.prototype.onCrowdJump = function (instant) {
    if (this.spawnCount)
        this.jumpOnSpawn = { instant: instant };
    
    this.stickmans.forEach(function (stickman, index) {
        if (!stickman.script.stickman.crashed)
            stickman.script.stickman.jump(instant);
    });
};

Crowd.prototype.getSpawnSosition = function () {
    var newPos = this.getCenter(),
        bound = this.stickmans.length * 0.05,
        newX,
        newZ;
    
    this.aabb = this.aabb || cr.Utils.getAABBRecursive(this.entity);
    
    newX = newPos.x + (this.aabb.halfExtents.x + 0.1) * (cr.Utils.getRandomInt(0, 1) ? 1 : -1);
    newZ = newPos.z + (cr.Utils.getRandomNumber(0, this.aabb.halfExtents.z) + 0.1) * (newPos.z < 0 ? 1 : -1);
    
    newPos.x = cr.Utils.bound2(newX, newPos.x - bound, newPos.x + bound);
    newPos.z = cr.Utils.bound(newZ, 5);
    
    return newPos;
};

Crowd.prototype.onCrowdSpawn = function (e) {
    var val = e.value;
    
    if (e.multiply) {
        val *= this.stickmans.length;
        val -= this.stickmans.length;
    }
    
    this.spawnCount += val;
};

Crowd.prototype.spawnMany = function (num) {
    for (var i = 0; i < num; i++) {
        this.spawn();
    }
    
    this.countControl.fire(cr.Events.CROWD_UPDATE, this.aliveStickmans);
};

Crowd.prototype.getCenter = function() {
    this.centerPos.copy(this.entity.getPosition());
    //this.centerPos.y = 0;
    
    return this.centerPos;
};

Crowd.prototype.spawn = function() {
    var newStickman = this.stickmanTemplate.resource.instantiate(),
        newPos = this.getCenter().clone();
    
    newPos.x += 0.1 * (cr.Utils.getRandomInt(0, 1) ? 1 : -1);
    newPos.y = newStickman.getPosition().y;
    newPos.z += 0.1 * cr.Utils.getRandomInt(1, 3) * (newPos.z < 0 ? 1 : -1);
    this.entity.addChild(newStickman);
    
    newStickman.enabled = true;
    newStickman.rigidbody.teleport(newPos, newStickman.getRotation());
    
    this.aliveStickmans++;
    this.stickmans.push(newStickman);
    
    if (this.jumpOnSpawn)
        newStickman.script.stickman.jump(this.jumpOnSpawn.instant);
    
    cr.SoundController.play(cr.Keys.SOUNDS.COUNTING);
};

// update code called every frame
Crowd.prototype.update = function(dt) {
    var stickman,
        stickmanPos,
        i;
    
    this.aabb = null;
    //this.camera.camera.fov = cr.Utils.isLandscape() ? 45 : 75;
    
    for (i = this.stickmans.length - 1; i >= 0; i--) {
        stickman = this.stickmans[i];
        stickmanPos = stickman.getPosition();
        
        if (stickmanPos.y < -2 || stickmanPos.x < -10) {
            if (!stickman.script.stickman.crashed) {
                this.entity.fire(cr.Events.CROWD_CRASH, stickman);
            }
            
            stickman.destroy();
            this.stickmans.splice(i, 1);
            continue;
        }
        
        this.centripetalForce.sub2(this.getCenter(), stickmanPos);
        this.centripetalForce.y = 0;

        stickman.rigidbody.applyForce(this.centripetalForce.scale(this.centripetalPower));
    }
    
    if (this.waitF) {
        this.waitF--;
        return;
    }
    
    if (!this.spawnCount) {
        this.jumpOnSpawn = false;
        return;
    }
    
    var sNum = Math.min(this.spawnCount, this.SPAWN_MAX);
    this.spawnCount -= sNum;
    this.waitF = this.WAIT_FRAMES;
    this.spawnMany(sNum);
};

// generic-6-dof-constraint.js
var Generic6DofConstraint = pc.createScript('generic6DofConstraint');

Generic6DofConstraint.attributes.add('linearLowerLimit', {
    title: 'Linear lower limit',
    description: 'Lower linear constraint in the local space of this entity.',
    type: 'vec3',
    default: [0, 0, 0]
});
Generic6DofConstraint.attributes.add('linearUpperLimit', {
    title: 'Linear upper limit',
    description: 'Upper linear constraint in the local space of this entity.',
    type: 'vec3',
    default: [0, 0, 0]
});

Generic6DofConstraint.attributes.add('angularLowerLimit', {
    title: 'Angular lower limit',
    description: 'Lower angular constraint in the local space of this entity.',
    type: 'vec3',
    default: [0, 0, 0]
});
Generic6DofConstraint.attributes.add('angularUpperLimit', {
    title: 'Angular upper limit',
    description: 'Upper angular constraint in the local space of this entity.',
    type: 'vec3',
    default: [0, 0, 0]
});

Generic6DofConstraint.attributes.add('enableCollision', {
    title: 'Enable Collision',
    description: 'Enable collision between linked rigid bodies.',
    type: 'boolean',
    default: true
});

// initialize code called once per entity
Generic6DofConstraint.prototype.initialize = function() {
    var v1 = new pc.Vec3(),
        v2 = new pc.Vec3(),
        q = new pc.Quat(),
        m = new pc.Mat4(),
        axisA = new pc.Vec3(0, 0, 0),
        bodyA = this.entity.rigidbody.body,
        pivotA = new Ammo.btVector3(0, 0, 0),
        localPosition = this.entity.getLocalPosition();

    cr.Utils.getOrthogonalVectors(axisA, v1, v2);
    m.set([
        axisA.x, axisA.y, axisA.z, 0,
        v1.x, v1.y, v1.z, 0,
        v2.x, v2.y, v2.z, 0,
        0, 0, 0, 1
    ]);
    q.setFromMat4(m);

    var quatA = new Ammo.btQuaternion(q.x, q.y, q.z, q.w);
    var frameA = new Ammo.btTransform(quatA, pivotA);
    frameA.setOrigin(pivotA);
    
    this.linearLowerLimit.x -= localPosition.x;
    this.linearUpperLimit.x -= localPosition.x;
    
    this.constraint = new Ammo.btGeneric6DofConstraint(bodyA, frameA);
    
    this.constraint.setLinearLowerLimit(new Ammo.btVector3(this.linearLowerLimit.x, 
                                                           this.linearLowerLimit.y, 
                                                           this.linearLowerLimit.z));
    
    this.constraint.setLinearUpperLimit(new Ammo.btVector3(this.linearUpperLimit.x, 
                                                           this.linearUpperLimit.y, 
                                                           this.linearUpperLimit.z));
    
    this.constraint.setAngularLowerLimit(new Ammo.btVector3(this.angularLowerLimit.x, 
                                                            this.angularLowerLimit.y, 
                                                            this.angularLowerLimit.z));
    
    this.constraint.setAngularUpperLimit(new Ammo.btVector3(this.angularUpperLimit.x, 
                                                            this.angularUpperLimit.y, 
                                                            this.angularUpperLimit.z));

    Ammo.destroy(frameA);
    Ammo.destroy(quatA);
    Ammo.destroy(pivotA);

    var dynamicsWorld = this.app.systems.rigidbody.dynamicsWorld;
    dynamicsWorld.addConstraint(this.constraint, !this.enableCollision);

    this.entity.rigidbody.activate();
};


// tile.js
var Tile = pc.createScript('tile');

// initialize code called once per entity
Tile.prototype.initialize = function() { 
    
};

Tile.prototype.setObstacle = function (tileType, mirror) {
    var obstacle = this.app.assets.find(tileType.name, 'template'),
        pos,
        envObj;
    
    envObj = obstacle.resource.instantiate();
    envObj.reparent(this.entity);
    envObj.enabled = true;
    
    if (mirror) {
        pos = envObj.getLocalPosition();
        pos.x *= -1;
        pos.z *= -1;
        
        envObj.setLocalPosition(pos);
        
        if (tileType == cr.Keys.SINGLE_OBSTACLES.HUMMER) {
            envObj.rotate(0, 180, 0);
            envObj.findByName('hummerShadow').rotateLocal(0, 180, 0);
        }
    }
    
    return envObj;
};

Tile.prototype.reset = function (tileType) {
    var mirror;
    
    this.entity.tileType = tileType;
    
    if (tileType.springboard) {
        if (tileType == cr.Keys.WALL_OBSTACLES.BREAK_WALL)
            this.entity.findByTag(cr.Keys.WALL_OBSTACLES.BREAK_WALL.name).forEach(part => part.enabled = false);
        else
            this.setObstacle(tileType);
        
        var springboard = this.setObstacle({name: 'springboard'}),
            sPos = springboard.getLocalPosition();
        
        if (cr.Utils.throwDice(0.6))
            sPos.z = 2 * (cr.Utils.getRandomInt(0, 1) ? 1 : -1);
        
        springboard.setLocalPosition(sPos);
        
        return;
    }
    
    mirror = tileType.twin && cr.Utils.getRandomInt(0, 1);
    
    switch (tileType) {
        case cr.Keys.SINGLE_OBSTACLES.BLANK:
            return;
        
        case cr.Keys.SINGLE_OBSTACLES.BREAK:
            this.entity
                .findByTag(cr.Keys.SINGLE_OBSTACLES.BREAK.name + (mirror ? '_l' : '_r'))
                .forEach(part => part.enabled = false);
            return;
    }
    
    this.setObstacle(tileType, mirror);
};

// stickman.js
var Stickman = pc.createScript('stickman');

// initialize code called once per entity
Stickman.prototype.initialize = function() {
    this.MAX_IDLE_SPEED = 0.1;
    this.JUMP_HEIGHT = 3.5;
    
    this.acceleration = cr.Storage.acceleration;
    this.animation = this.entity.findByName('Model').animation;
    this.idle = true;
    this.initPos = this.entity.getPosition().clone();
    
    this.MAX_Y = this.initPos + this.JUMP_HEIGHT + 0.5;
    
    setTimeout(function () {
            if (this.flying)
                return;
            
            if (this.acceleration.velocity < this.MAX_IDLE_SPEED) {
                this.animation.play('Idle01.glb');
                this.randomizeAnimPhase();
            } else {
                this.idle = false;
                this.animation.play('RunNormal.glb');
            }
        }.bind(this), 0);
    
    this.entity.rigidbody.on('collisionstart', this.onCollision, this);
    this.entity.rigidbody.on('triggerenter', this.onTrigger, this);
};

Stickman.prototype.randomizeAnimPhase = function () {
    if (!this.animation.currAnim)
        return;
    
    this.animation.currentTime = this.animation.duration * Math.random();
};

Stickman.prototype.onTrigger = function (e) {
    if (e.tags.has('obstacle')) {
        cr.SoundController.play(cr.Keys.SOUNDS.STICKMAN_HIT_1);
        this.crash();
    }
};

Stickman.prototype.onCollision = function (e) {
    if (e.other.tags.has('obstacle')) {
        cr.SoundController.play(cr.Keys.SOUNDS.STICKMAN_HIT_1);
        this.crash();
    } else if (e.other.name == 'Enemy Stickman') {
        cr.SoundController.play(cr.Keys.SOUNDS.STICKMAN_HIT_2);
        this.crash();
    }
    
    if (e.other.tags.has('springboard'))
        this.jump();
};

Stickman.prototype.jump = function (instant) {
    var pos = this.entity.getPosition();
    
    if (instant) {
        this.entity.rigidbody.teleport(pos.x, pos.y + this.JUMP_HEIGHT, pos.z);
    } else {
        this.entity.rigidbody.applyImpulse(new pc.Vec3(0, 175, 0));
        cr.SoundController.play(cr.Keys.SOUNDS.JUMP);
    }
    
    this.animation.play('InAir_StaticPose.glb');
    this.flying = true;
    this.idle = false;
};

Stickman.prototype.crash = function (isBreak) {
    var pos = this.entity.getPosition().clone(),
        crowd = this.entity.parent;
    
    this.crashed = true;
    this.breaked = isBreak;
    
    this.entity.rigidbody.off('triggerenter', this.onTrigger);
    this.entity.rigidbody.off('collisionstart', this.onCollision);
    //this.entity.rigidbody.type = pc.RIGIDBODY_TYPE_KINEMATIC;
    this.entity.rigidbody.enabled = false;
    this.entity.collision.enabled = false;
    
    pos.y = this.initPos.y;
    
    this.entity.reparent(this.entity.parent.parent);
    this.entity.rigidbody.teleport(pos);

    this.entity.findByName('3D Screen').enabled = false;
    
    if (!isBreak) {
        this.animation.loop = false;
        this.animation.play('Death.glb');
    } else {
        this.animation.play('InAir_StaticPose.glb');
    }
    
    crowd.fire(cr.Events.CROWD_CRASH, this.entity);
};

// update code called every frame
Stickman.prototype.update = function(dt) {
    var pos = this.entity.getPosition(),
        breakedVel;
    
    if (pos.y < (this.initPos.y - 0.05) && !this.breaked) {
        this.crash(true);
        cr.SoundController.play(cr.Keys.SOUNDS.JUMP);
    }
    
    if (!this.crashed) {
        if (pos.y < (this.initPos.y + 0.01) && this.flying) {
            this.flying = false;
            this.idle = false;
            this.animation.play('RunNormal.glb');
        }

        if (this.acceleration.velocity > this.MAX_IDLE_SPEED && this.idle) {
            this.idle = false;
            this.flying = false;
            this.animation.play('RunNormal.glb');
            this.randomizeAnimPhase();
        }

        if (this.acceleration.velocity < this.MAX_IDLE_SPEED && !this.idle) {
            this.idle = true;
            this.flying = false;
            this.animation.play('Idle01.glb');
            this.randomizeAnimPhase();
        }
    }
    
    breakedVel = this.breaked ? -9.8 * dt : 0;
    
    if (this.crashed)
        this.entity.translate(-this.acceleration.velocity * dt, breakedVel, 0);
    else if (pos.y > this.MAX_Y)
        this.entity.rigidbody.teleport(pos.x, this.MAX_Y, pos.z);
};

// multiplier.js
var Multiplier = pc.createScript('multiplier');

// initialize code called once per entity
Multiplier.prototype.initialize = function() {
    var leftText = this.entity.findByName('left').element,
        rightText = this.entity.findByName('right').element,
        multiply = cr.Utils.getRandomInt(0, 1),
        leftSide = this.entity.findByTag('left_side'),
        rightSide = this.entity.findByTag('right_side');
    
    this.crowd = cr.Storage.crowd;
    
    this.left = { multiply: multiply,
                  value: this.getValue(multiply),
                  elements: leftSide };
    
    this.right = { multiply: !multiply,
                   value: this.getValue(!multiply),
                   elements: rightSide };
    
    leftText.text = (this.left.multiply ? 'x' : '+') + this.left.value;
    rightText.text = (this.right.multiply ? 'x' : '+') + this.right.value;
};

Multiplier.prototype.getValue = function(multiply) {
    return multiply ? cr.Utils.getRandomInt(2, 3) : cr.Utils.getRandomInt(2, 15) * 5;
};

Multiplier.prototype.getMultiplier = function(crowdPos) {
    return crowdPos.z > 0 ? this.right : this.left;
};

Multiplier.prototype.hideMultiplier = function(multiplier) {
    multiplier.elements.forEach(element => element.enabled = false);
};

Multiplier.prototype.update = function() {
    if (this.triggered)
        return;
    
    var pos = this.entity.getPosition(),
        crowdPos = this.crowd.getPosition(),
        multiplier;
    
    if (pos.x < crowdPos.x) {
        multiplier = this.getMultiplier(crowdPos);
        
        this.app.fire(cr.Events.CROWD_SPAWN, multiplier);
        this.triggered = true;
        
        this.hideMultiplier(multiplier);
    }
};

// count.js
var Count = pc.createScript('count');

// initialize code called once per entity
Count.prototype.initialize = function() {
    this.textElement = this.entity.findByName('Count').element;
    this.entity.on(cr.Events.CROWD_UPDATE, this.onCrowdUpdate, this);
};

Count.prototype.onCrowdUpdate = function(count) {
    this.textElement.text = count;
    this.entity.element.width = this.textElement.textWidth + 10;
};

// enemy-crowd.js
var EnemyCrowd = pc.createScript('enemyCrowd');

EnemyCrowd.attributes.add('centripetalPower', {
    type: 'number',
    default: 10,
    description: 'Centripetal power'
});

// initialize code called once per entity
EnemyCrowd.prototype.postInitialize = function() {
    var onCrash = function (crashed) {
        this.countControl.fire(cr.Events.CROWD_UPDATE, --this.aliveStickmans);
    }.bind(this);
    
    this.fight = false;
    this.aliveStickmans = 0;
    this.stickmans = [];
    this.rows = {};
    this.aabb = null;
    this.centripetalForce = new pc.Vec3();
    this.countControl = this.entity.findByTag('count-control')[0];
    this.centerPos = this.entity.getPosition();
    
    this.stickmanTemplate = this.app.assets.find('Enemy Stickman', 'template');
    
    // do not spawn more than 272 units in one frame
    this.spawnMany(Math.min(Math.floor(Math.max(cr.Storage.crowdSize, 5) / 5) * 5, cr.Utils.getRandomInt(3, 17) * 5));
    
    this.entity.on(cr.Events.CROWD_CRASH, onCrash);
};

EnemyCrowd.prototype.getSpawnSosition = function () {
    var side = 0.4,
        newPos = new pc.Vec3(this.centerPos.x, 1, this.centerPos.z),
        rowKeys = Object.keys(this.rows),
        row,
        zInd,
        i,
        
        addRow = function (r) {
            this.rows[r] = 1;
            row = r;
            zInd = 0;
        }.bind(this),
        
        setRow = function (r) {
            this.rows[r]++;
            row = r;
            zInd = getZInd(this.rows[r]);
        }.bind(this),
        
        getZInd = function (zNum) {
            if (zNum % 2) {
                return -(zNum - 1) / 2;
            } else {
                return zNum / 2;
            }
        }.bind(this);
    
    for (i = 0; i < rowKeys.length; i++) {
        if (!this.rows[Number(rowKeys[i]) + 1] && this.rows[Number(rowKeys[i])] == 2) {
            addRow(Number(rowKeys[i]) + 1);
            break;
        } else if (!this.rows[-Number(rowKeys[i]) - 1] && this.rows[-Number(rowKeys[i])] == 2) {
            addRow(-Number(rowKeys[i]) - 1);
            break;
        } else if (this.rows[Number(rowKeys[i]) + 1] && 
                   this.rows[Number(rowKeys[i])] == this.rows[Number(rowKeys[i]) + 1] + 2) {
            setRow(Number(rowKeys[i]) + 1);
            break;
        } else if (this.rows[-Number(rowKeys[i]) - 1] && 
                   this.rows[-Number(rowKeys[i])] == this.rows[-Number(rowKeys[i]) - 1] + 2) {
            setRow(-Number(rowKeys[i]) - 1);
            break;
        }
    }
    
    if (!rowKeys.length)
        addRow(0);
    else if(row === undefined)
        setRow(0);
    
    newPos.x += row * side;
    newPos.z += zInd * side;
    
    return newPos;
};

EnemyCrowd.prototype.spawnMany = function (num) {
    for (var i = 0; i < num; i++) {
        this.spawn();
    }
    
    this.countControl.fire(cr.Events.CROWD_UPDATE, this.aliveStickmans);
};

EnemyCrowd.prototype.spawn = function() {
    var newStickman = this.stickmanTemplate.resource.instantiate(),
        newPos = this.getSpawnSosition();
    
    this.entity.addChild(newStickman);
    
    newStickman.enabled = true;
    newStickman.rigidbody.teleport(newPos, newStickman.getRotation());
    
    this.aliveStickmans++;
    this.stickmans.push(newStickman);
};

EnemyCrowd.prototype.setDynamic = function() {
    this.stickmans.forEach(s => {
        s.rigidbody.type = pc.RIGIDBODY_TYPE_DYNAMIC;
    });
};

// update code called every frame
EnemyCrowd.prototype.update = function(dt) {
    var pos = this.entity.getPosition(),
        stickman,
        stickmanPos,
        i;
    
    this.aabb = null;
    
    for (i = this.stickmans.length - 1; i >= 0; i--) {
        stickman = this.stickmans[i];
        stickmanPos = stickman.getPosition();
        
        if (stickmanPos.y < -3 || stickmanPos.x < -10) {
            if (!stickman.script.enemyStickman.crashed) {
                this.entity.fire(cr.Events.CROWD_CRASH, stickman);
            }
            
            stickman.destroy();
            this.stickmans.splice(i, 1);
            continue;
        }
        
        this.centripetalForce.sub2(cr.Storage.crowd.getPosition(), stickmanPos);
        this.centripetalForce.y = 0;

        stickman.rigidbody.applyForce(this.centripetalForce.scale(this.centripetalPower));
    }
    
    if (cr.Utils.isInRange(0, 5, pos.x) && !this.fight && this.aliveStickmans) {
        this.setDynamic();
        this.fight = true;
        this.app.fire(cr.Events.FIGHT_START, this);
    } else if (this.fight && !this.aliveStickmans) {
        this.fight = false;
        this.app.fire(cr.Events.FIGHT_END, this);
    }
};

// enemy-stickman.js
var EnemyStickman = pc.createScript('enemyStickman');

// initialize code called once per entity
EnemyStickman.prototype.initialize = function() {
    this.acceleration = cr.Storage.acceleration;
    this.animation = this.entity.findByName('Model').animation;
    
    setTimeout(() => this.animation.enabled = false, 0);
    
    this.entity.rigidbody.on('collisionstart', this.onCollision, this);
};

EnemyStickman.prototype.onCollision = function (e) {
    if (e.other.name == 'Stickman')
        this.crash();
};

EnemyStickman.prototype.crash = function () {
    this.crashed = true;
    this.entity.parent.fire(cr.Events.CROWD_CRASH, this.entity);
    this.entity.rigidbody.off('collisionstart', this.onCollision);
    this.entity.rigidbody.enabled = false;
    this.entity.collision.enabled = false;
    
    this.entity.findByName('3D Screen').enabled = false;

    this.animation.enabled = true;
    this.animation.loop = false;
    this.animation.play('Death.glb');
};

// update code called every frame
EnemyStickman.prototype.update = function(dt) {
    //this.entity.translate(-this.acceleration.velocity * dt, 0, 0);
};

// hover.js
var Hover = pc.createScript('hover');

Hover.attributes.add('hoverTexture', { type: 'asset', assetType: 'texture' });

// initialize code called once per entity
Hover.prototype.initialize = function() {
    var onMouseEnter = function () {
            this.entity.element.texture = this.hoverTexture.resource;
        }.bind(this),
        
        onMouseLeave = function () {
            this.entity.element.textureAsset = this.freeTextureAsset;
        }.bind(this);
    
    this.freeTextureAsset = this.entity.element.textureAsset;
    
    this.entity.element.on('mouseenter', onMouseEnter);
    this.entity.element.on('mouseleave', onMouseLeave);
};


// fail-screen.js
var FailScreen = pc.createScript('failScreen');

FailScreen.attributes.add("continueBtn", {type: "entity"});

// initialize code called once per entity
FailScreen.prototype.initialize = function() {
    var onEnable = function () {
            this.continueBtn.enabled = false;
            
            Promise.all([
                window.famobi_analytics.trackEvent(
                    "EVENT_LEVELFAIL",
                    {
                        levelName: '' + cr.Storage.currentMission,
                        reason: 'dead'
                    }
                ),
                window.famobi_analytics.trackEvent(
                    "EVENT_LEVELSCORE",
                    {
                        levelName: '' +  cr.Storage.currentMission,
                        levelScore: Math.floor(cr.Storage.distance || 0)
                    }
                ),
                window.famobi.showInterstitialAd()
            ]).then(() => showButtons(0.5), () => showButtons(0.5));
        },
        
        showButtons = (delay) => {
            console.log('Displaying buttons...');
            setTimeout(() => {
                
                this.continueBtn.enabled = true;

            }, delay * 1000);
        },
        
        restart = function () {
            window.famobi_analytics.trackEvent("EVENT_LEVELRESTART", {levelName: '' + cr.Storage.currentMission});
            this.app.fire(cr.Events.GAME_RESTART);
        }.bind(this);
    
    this.continueBtn.element.on('click', restart);
    this.on('enable', onEnable);
};

// finish.js
var Finish = pc.createScript('finish');

// initialize code called once per entity
Finish.prototype.initialize = function() {
    this.crowd = cr.Storage.crowd;
};

Finish.prototype.update = function() {
    if (this.triggered)
        return;
    
    var pos = this.entity.getPosition(),
        crowdPos = this.crowd.getPosition();
    
    if (pos.x < crowdPos.x) {
        cr.Storage.gameState = cr.Keys.GAME_STATES.PASSED;
        
        this.app.fire(cr.Events.GAME_OVER);
        
        this.triggered = true;
    }
};

// win-screen.js
var WinScreen = pc.createScript('winScreen');

WinScreen.attributes.add("missionMoney", {type: "entity"});
WinScreen.attributes.add("continueBtn", {type: "entity"});
WinScreen.attributes.add("watchAdBtn", {type: "entity"});
WinScreen.attributes.add("rewardAmountAd", {type: "entity"});
WinScreen.attributes.add("rewardAmount", {type: "entity"});

// initialize code called once per entity
WinScreen.prototype.initialize = function() {
    var onEnable = function () {
            cr.Storage.scores = cr.Storage.crowdSize * cr.Storage.unitIncome;
                
            this.missionMoney.script.animateNumber.set(cr.Storage.scores, true);
            this.rewardAmountAd.script.animateNumber.set(cr.Storage.scores * 2, true);
            this.rewardAmount.script.animateNumber.set(cr.Storage.scores, true);
            
            this.watchAdBtn.enabled = false;
            this.continueBtn.enabled = false;
        
            setTimeout(() => {
                Promise.all([
                    window.famobi_analytics.trackEvent(
                        "EVENT_LEVELSUCCESS",
                        {
                            levelName: '' +  cr.Storage.currentMission
                        }
                    ),
                    window.famobi_analytics.trackEvent(
                        "EVENT_LEVELSCORE",
                        {
                            levelName: '' +  cr.Storage.currentMission,
                            levelScore: Math.floor(cr.Storage.distance || 0)
                        }
                    ),
                    window.famobi.showInterstitialAd()
                ]).then(() => showButtons(0.5), () => showButtons(0.5));
            }, 500);
        }.bind(this),
        
        showButtons = (delay) => {
            console.log('Displaying buttons...');
            setTimeout(() => {
                
                this.continueBtn.enabled = true;
                this.watchAdBtn.enabled = Apicontroller.hasRewardedVideo();

            }, delay * 1000);
        },
        
        watchAd = function () {
            if (!Apicontroller.hasRewardedVideo() || this.showingAd)
                return;
                
            Apicontroller.showRewardedVideo((result) => {
                if (result.rewardGranted) {
                    cr.Storage.scores *= 2;

                    restart();
                }
                
                this.showingAd = false;
            });
        }.bind(this),
        
        restart = function () {
            cr.Storage.totalCash += cr.Storage.scores;
            
            cr.Utils.setStorageItem(cr.Keys.STORAGE_KEYS.CASH, cr.Storage.totalCash);
            
            this.app.fire(cr.Events.GAME_RESTART);
        }.bind(this);
    
    this.continueBtn.element.on('click', restart);
    this.watchAdBtn.element.on('click', watchAd);
    
    this.on('enable', onEnable);
    
    onEnable();
};

// basicButton.js
/* jshint esversion: 6 */
var BasicButton = pc.createScript('basicButton');


BasicButton.attributes.add('applyScalingTween', {
    title: "Apply scaling tween",
    type: 'boolean',
    default: true
});

BasicButton.attributes.add('defaultScale', {
    title: "Default scale",
    type: 'number',
    default: 1,
    min: 0.5,
    max: 1.5
});

BasicButton.attributes.add('hoverScale', {
    title: "Hover scale",
    type: 'number',
    default: 1.03,
    min: 0.5,
    max: 1.5
});

BasicButton.attributes.add('pressedScale', {
    title: "Pressed scale",
    type: 'number',
    default: 0.97,
    min: 0.5,
    max: 1.5
});

BasicButton.attributes.add('upScaleDuration', {
    title: "Tween duration",
    type: 'number',
    default: 0.085,
    min: 0.005,
    max: 1
});

BasicButton.attributes.add('clickSound', {
    title: "Play sound",
    type: 'boolean',
    default: true
});

BasicButton.attributes.add('soundOnRelease', {
    title: "Sound on release",
    type: 'boolean',
    default: false
});

BasicButton.attributes.add('allowClickThrough', {
    title: "Click through",
    type: 'boolean',
    default: false
});

BasicButton.prototype.initialize = function() {

    // Whether the element is currently hovered or not
    this.hovered = false;

    if(pc.platform.mobile && this.app.touch) {
        this.entity.element.on('touchstart', this.onPress, this);
        this.entity.element.on('touchend', this.onRelease, this);
    } else {
        this.entity.element.on('mouseenter', this.onEnter, this);
        this.entity.element.on('mousedown', this.onPress, this);
        this.entity.element.on('mouseup', this.onRelease, this);
        this.entity.element.on('mouseleave', this.onLeave, this);
    }
};


// When the cursor enters the element assign the hovered texture
BasicButton.prototype.onEnter = function (event) {
    this.hovered = true;
    
    if(this.applyScalingTween) {
        event.element.entity.tween(event.element.entity.getLocalScale())
            .to(new pc.Vec3(this.defaultScale * this.hoverScale, this.defaultScale * this.hoverScale, this.defaultScale * this.hoverScale), this.upScaleDuration, pc.Linear)
            .start();
    }
    document.body.style.cursor = 'pointer';
};

BasicButton.prototype.onLeave = function (event) {
    this.hovered = false;
    
    if(this.applyScalingTween) {
         event.element.entity.tween(event.element.entity.getLocalScale())
            .to(new pc.Vec3(this.defaultScale, this.defaultScale, this.defaultScale), this.upScaleDuration, pc.Linear)
            .start();
    }
   

    document.body.style.cursor = 'default';
};

// When we press the element assign the active texture
BasicButton.prototype.onPress = function (event) {
    if (!this.allowClickThrough) event.stopPropagation();
    
    if (this.clickSound && !this.soundOnRelease) {
        cr.SoundController.play(cr.Keys.SOUNDS.BUTTON_CLICK);
    }
    this.wasPressed = true;
    
    if (this.applyScalingTween) {
        event.element.entity.tween(event.element.entity.getLocalScale())
            .to(new pc.Vec3(this.defaultScale * this.pressedScale, this.defaultScale * this.pressedScale, this.defaultScale * this.pressedScale), this.upScaleDuration * 0.5, pc.SineOut)
            .start();
    }
};

BasicButton.prototype.onRelease = function (event) {
    if (this.applyScalingTween) {
         if (this.hovered) {
             event.element.entity.tween(event.element.entity.getLocalScale())
                .to(new pc.Vec3(this.defaultScale * this.hoverScale, this.defaultScale * this.hoverScale, this.defaultScale * this.hoverScale), this.upScaleDuration * 0.5, pc.Linear)
                .start();
        } else {
            event.element.entity.tween(event.element.entity.getLocalScale())
                .to(new pc.Vec3(this.defaultScale, this.defaultScale, this.defaultScale), this.upScaleDuration * 0.5, pc.Linear)
                .start();
        }
        
        if (this.clickSound && this.soundOnRelease && this.wasPressed) {
            cr.SoundController.play(cr.Keys.SOUNDS.BUTTON_CLICK);
        }
    }
    this.wasPressed = false;
};

BasicButton.assignAction = function(button, handler, handlerContext) {
     if(pc.app.touch) {
         button.element.on('touchstart', handler, handlerContext);
     } 
     if(pc.app.mouse) {
          button.element.on('mousedown', handler, handlerContext);
     } 
};


BasicButton.assignTapAction = function(button, handler, handlerContext) {
     
    if(pc.app.touch) {
        button.element.on('touchstart', (event) => {
            button.inputDownParams = {x: event.touch.clientX, y: event.touch.clientY};
        });
        button.element.on('touchend', (event) => {
            if(button.inputDownParams && Utils.distanceBetween( event.touch.clientX,  event.touch.clientY, button.inputDownParams.x,  button.inputDownParams.y) < 3) {
                handler.call(handlerContext, event);
            }
            button.inputDownParams = null;
        });
    } 
    
    if(pc.app.mouse) {
        button.element.on('mousedown', (event) => {
            button.inputDownParams = {x: event.x, y: event.y};
        });
        button.element.on('mouseup', (event) => {
            if(button.inputDownParams && Utils.distanceBetween(event.x, event.y, button.inputDownParams.x,  button.inputDownParams.y) < 3) {
                handler.call(handlerContext, event);
            }
            button.inputDownParams = null;
        });
    } 
};

// scalePulseTween.js
/* jshint esversion: 6 */
var ScalePulseTween = pc.createScript('scalePulseTween');

ScalePulseTween.attributes.add('targetScale', {
    type: 'vec3',
    default: [1.1, 0.925, 1]
});

ScalePulseTween.attributes.add('duration', {
    type: 'number',
    default: 0.9
});

ScalePulseTween.attributes.add('yoyo', {
    type: 'boolean',
    default: true
});

ScalePulseTween.attributes.add('loop', {
    type: 'boolean',
    default: true
});


ScalePulseTween.attributes.add('easing', {
    type: 'string',
    enum: [
        {"Linear": "Linear"},
        {"QuadraticIn": "QuadraticIn"},
        {"QuadraticOut": "QuadraticOut"},
        {"QuadraticInOut": "QuadraticInOut"},
        {"CubicIn": "CubicIn"},
        {"CubicOut": "CubicOut"},
        {"CubicInOut": "CubicInOut"},
        {"QuarticIn": "QuarticIn"},
        {"QuarticOut": "QuarticOut"},
        {"QuarticInOut": "QuarticInOut"},
        {"QuinticIn": "QuinticIn"},
        {"QuinticOut": "QuinticOut"},
        {"QuinticInOut": "QuinticInOut"},
        {"SineIn": "SineIn"},
        {"SineOut": "SineOut"},
        {"SineInOut": "SineInOut"},
        {"ExponentialIn": "ExponentialIn"},
        {"ExponentialOut": "ExponentialOut"},
        {"ExponentialInOut": "ExponentialInOut"},
        {"CircularIn": "CircularIn"},
        {"CircularOut": "CircularOut"},
        {"CircularInOut": "CircularInOut"},
        {"BackIn": "BackIn"},
        {"BackOut": "BackOut"},
        {"BackInOut": "BackInOut"},
        {"BounceIn": "BounceIn"},
        {"BounceOut": "BounceOut"},
        {"BounceInOut": "BounceInOut"},
        {"ElasticIn": "ElasticIn"},
        {"ElasticOut": "ElasticOut"},
        {"ElasticInOut": "ElasticInOut"}
    ],
    default: "Linear"
});

ScalePulseTween.prototype.initialize = function() {
    this.initialScale = this.entity.getLocalScale().clone();
    
    this._restartTween();
    this.on('attr', this._restartTween, this);
};


ScalePulseTween.prototype.update = function(dt) {
    
};


ScalePulseTween.prototype._restartTween = function() {
    this.app.stopAllTweens(this.entity);
    this.entity.setLocalScale(this.initialScale);
    
    this.entity.tween(this.entity.getLocalScale())
        .to(this.targetScale, this.duration, pc[this.easing])
        .yoyo(this.yoyo)
        .loop(this.loop)
        .start(); 
};


// tween.js
pc.extend(pc, function () {

    /**
     * @name pc.TweenManager
     * @description Handles updating tweens
     * @param {pc.Application} app  - The application
     */
    var TweenManager = function (app) {
        this._app = app;
        this._tweens = [];
        this._add = []; // to be added
    };

    TweenManager.prototype = {
        add: function (tween) {
            this._add.push(tween);
            return tween;
        },

        update: function (dt) {
            var i = 0;
            var n = this._tweens.length;
            while (i < n) {
                if (this._tweens[i].update(dt)) {
                    i++;
                } else {
                    this._tweens.splice(i, 1);
                    n--;
                }
            }

            // add any tweens that were added mid-update
            if (this._add.length) {
                this._tweens = this._tweens.concat(this._add);
                this._add.length = 0;
            }
        }
    };

    /**
     * @name  pc.Tween
     * @param {object} target - The target property that will be tweened
     * @param {pc.TweenManager} manager - The tween manager
     * @param {pc.Entity} entity - The pc.Entity whose property we are tweening
     */
    var Tween = function (target, manager, entity) {
        pc.events.attach(this);

        this.manager = manager;

        if (entity) {
            this.entity = null; // if present the tween will dirty the transforms after modify the target
        }

        this.time = 0;

        this.complete = false;
        this.playing = false;
        this.stopped = true;
        this.pending = false;

        this.target = target;

        this.duration = 0;
        this._currentDelay = 0;
        this.timeScale = 1;
        this._reverse = false;

        this._delay = 0;
        this._yoyo = false;

        this._count = 0;
        this._numRepeats = 0;
        this._repeatDelay = 0;

        this._from = false; // indicates a "from" tween

        // for rotation tween
        this._slerp = false; // indicates a rotation tween
        this._fromQuat = new pc.Quat();
        this._toQuat = new pc.Quat();
        this._quat = new pc.Quat();

        this.easing = pc.Linear;

        this._sv = {}; // start values
        this._ev = {}; // end values
    };

    var _parseProperties = function (properties) {
        var _properties;
        if (properties instanceof pc.Vec2) {
            _properties = {
                x: properties.x,
                y: properties.y
            };
        } else if (properties instanceof pc.Vec3) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z
            };
        } else if (properties instanceof pc.Vec4) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z,
                w: properties.w
            };
        } else if (properties instanceof pc.Quat) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z,
                w: properties.w
            };
        } else if (properties instanceof pc.Color) {
            _properties = {
                r: properties.r,
                g: properties.g,
                b: properties.b
            };
            if (properties.a !== undefined) {
                _properties.a = properties.a;
            }
        } else {
            _properties = properties;
        }
        return _properties;
    };
    Tween.prototype = {
        // properties - js obj of values to update in target
        to: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);
            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            return this;
        },

        from: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);
            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            this._from = true;

            return this;
        },

        rotate: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);

            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            this._slerp = true;

            return this;
        },

        start: function () {
            var prop, _x, _y, _z;

            this.playing = true;
            this.complete = false;
            this.stopped = false;
            this._count = 0;
            this.pending = (this._delay > 0);

            if (this._reverse && !this.pending) {
                this.time = this.duration;
            } else {
                this.time = 0;
            }

            if (this._from) {
                for (prop in this._properties) {
                    if (this._properties.hasOwnProperty(prop)) {
                        this._sv[prop] = this._properties[prop];
                        this._ev[prop] = this.target[prop];
                    }
                }

                if (this._slerp) {
                    this._toQuat.setFromEulerAngles(this.target.x, this.target.y, this.target.z);

                    _x = this._properties.x !== undefined ? this._properties.x : this.target.x;
                    _y = this._properties.y !== undefined ? this._properties.y : this.target.y;
                    _z = this._properties.z !== undefined ? this._properties.z : this.target.z;
                    this._fromQuat.setFromEulerAngles(_x, _y, _z);
                }
            } else {
                for (prop in this._properties) {
                    if (this._properties.hasOwnProperty(prop)) {
                        this._sv[prop] = this.target[prop];
                        this._ev[prop] = this._properties[prop];
                    }
                }

                if (this._slerp) {
                    this._fromQuat.setFromEulerAngles(this.target.x, this.target.y, this.target.z);

                    _x = this._properties.x !== undefined ? this._properties.x : this.target.x;
                    _y = this._properties.y !== undefined ? this._properties.y : this.target.y;
                    _z = this._properties.z !== undefined ? this._properties.z : this.target.z;
                    this._toQuat.setFromEulerAngles(_x, _y, _z);
                }
            }

            // set delay
            this._currentDelay = this._delay;

            // add to manager when started
            this.manager.add(this);

            return this;
        },

        pause: function () {
            this.playing = false;
        },

        resume: function () {
            this.playing = true;
        },

        stop: function () {
            this.playing = false;
            this.stopped = true;
        },

        delay: function (delay) {
            this._delay = delay;
            this.pending = true;

            return this;
        },

        repeat: function (num, delay) {
            this._count = 0;
            this._numRepeats = num;
            if (delay) {
                this._repeatDelay = delay;
            } else {
                this._repeatDelay = 0;
            }

            return this;
        },

        loop: function (loop) {
            if (loop) {
                this._count = 0;
                this._numRepeats = Infinity;
            } else {
                this._numRepeats = 0;
            }

            return this;
        },

        yoyo: function (yoyo) {
            this._yoyo = yoyo;
            return this;
        },

        reverse: function () {
            this._reverse = !this._reverse;

            return this;
        },

        chain: function () {
            var n = arguments.length;

            while (n--) {
                if (n > 0) {
                    arguments[n - 1]._chained = arguments[n];
                } else {
                    this._chained = arguments[n];
                }
            }

            return this;
        },

        update: function (dt) {
            if (this.stopped) return false;

            if (!this.playing) return true;

            if (!this._reverse || this.pending) {
                this.time += dt * this.timeScale;
            } else {
                this.time -= dt * this.timeScale;
            }

            // delay start if required
            if (this.pending) {
                if (this.time > this._currentDelay) {
                    if (this._reverse) {
                        this.time = this.duration - (this.time - this._currentDelay);
                    } else {
                        this.time -= this._currentDelay;
                    }
                    this.pending = false;
                } else {
                    return true;
                }
            }

            var _extra = 0;
            if ((!this._reverse && this.time > this.duration) || (this._reverse && this.time < 0)) {
                this._count++;
                this.complete = true;
                this.playing = false;
                if (this._reverse) {
                    _extra = this.duration - this.time;
                    this.time = 0;
                } else {
                    _extra = this.time - this.duration;
                    this.time = this.duration;
                }
            }

            var elapsed = (this.duration === 0) ? 1 : (this.time / this.duration);

            // run easing
            var a = this.easing(elapsed);

            // increment property
            var s, e;
            for (var prop in this._properties) {
                if (this._properties.hasOwnProperty(prop)) {
                    s = this._sv[prop];
                    e = this._ev[prop];
                    this.target[prop] = s + (e - s) * a;
                }
            }

            if (this._slerp) {
                this._quat.slerp(this._fromQuat, this._toQuat, a);
            }

            // if this is a entity property then we should dirty the transform
            if (this.entity) {
                this.entity._dirtifyLocal();

                // apply element property changes
                if (this.element && this.entity.element) {
                    this.entity.element[this.element] = this.target;
                }

                if (this._slerp) {
                    this.entity.setLocalRotation(this._quat);
                }
            }

            this.fire("update", dt);

            if (this.complete) {
                var repeat = this._repeat(_extra);
                if (!repeat) {
                    this.fire("complete", _extra);
                    if (this.entity)
                        this.entity.off('destroy', this.stop, this);
                    if (this._chained) this._chained.start();
                } else {
                    this.fire("loop");
                }

                return repeat;
            }

            return true;
        },

        _repeat: function (extra) {
            // test for repeat conditions
            if (this._count < this._numRepeats) {
                // do a repeat
                if (this._reverse) {
                    this.time = this.duration - extra;
                } else {
                    this.time = extra; // include overspill time
                }
                this.complete = false;
                this.playing = true;

                this._currentDelay = this._repeatDelay;
                this.pending = true;

                if (this._yoyo) {
                    // swap start/end properties
                    for (var prop in this._properties) {
                        var tmp = this._sv[prop];
                        this._sv[prop] = this._ev[prop];
                        this._ev[prop] = tmp;
                    }

                    if (this._slerp) {
                        this._quat.copy(this._fromQuat);
                        this._fromQuat.copy(this._toQuat);
                        this._toQuat.copy(this._quat);
                    }
                }

                return true;
            }
            return false;
        }

    };


    /**
     * Easing methods
     */

    var Linear = function (k) {
        return k;
    };

    var QuadraticIn = function (k) {
        return k * k;
    };

    var QuadraticOut = function (k) {
        return k * (2 - k);
    };

    var QuadraticInOut = function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k;
        }
        return -0.5 * (--k * (k - 2) - 1);
    };

    var CubicIn = function (k) {
        return k * k * k;
    };

    var CubicOut = function (k) {
        return --k * k * k + 1;
    };

    var CubicInOut = function (k) {
        if ((k *= 2) < 1) return 0.5 * k * k * k;
        return 0.5 * ((k -= 2) * k * k + 2);
    };

    var QuarticIn = function (k) {
        return k * k * k * k;
    };

    var QuarticOut = function (k) {
        return 1 - (--k * k * k * k);
    };

    var QuarticInOut = function (k) {
        if ((k *= 2) < 1) return 0.5 * k * k * k * k;
        return - 0.5 * ((k -= 2) * k * k * k - 2);
    };

    var QuinticIn = function (k) {
        return k * k * k * k * k;
    };

    var QuinticOut = function (k) {
        return --k * k * k * k * k + 1;
    };

    var QuinticInOut = function (k) {
        if ((k *= 2) < 1) return 0.5 * k * k * k * k * k;
        return 0.5 * ((k -= 2) * k * k * k * k + 2);
    };

    var SineIn = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return 1 - Math.cos(k * Math.PI / 2);
    };

    var SineOut = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return Math.sin(k * Math.PI / 2);
    };

    var SineInOut = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return 0.5 * (1 - Math.cos(Math.PI * k));
    };

    var ExponentialIn = function (k) {
        return k === 0 ? 0 : Math.pow(1024, k - 1);
    };

    var ExponentialOut = function (k) {
        return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);
    };

    var ExponentialInOut = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        if ((k *= 2) < 1) return 0.5 * Math.pow(1024, k - 1);
        return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);
    };

    var CircularIn = function (k) {
        return 1 - Math.sqrt(1 - k * k);
    };

    var CircularOut = function (k) {
        return Math.sqrt(1 - (--k * k));
    };

    var CircularInOut = function (k) {
        if ((k *= 2) < 1) return - 0.5 * (Math.sqrt(1 - k * k) - 1);
        return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    };

    var ElasticIn = function (k) {
        var s, a = 0.1, p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
            a = 1; s = p / 4;
        } else s = p * Math.asin(1 / a) / (2 * Math.PI);
        return - (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
    };

    var ElasticOut = function (k) {
        var s, a = 0.1, p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
            a = 1; s = p / 4;
        } else s = p * Math.asin(1 / a) / (2 * Math.PI);
        return (a * Math.pow(2, - 10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);
    };

    var ElasticInOut = function (k) {
        var s, a = 0.1, p = 0.4;
        if (k === 0) return 0;
        if (k === 1) return 1;
        if (!a || a < 1) {
            a = 1; s = p / 4;
        } else s = p * Math.asin(1 / a) / (2 * Math.PI);
        if ((k *= 2) < 1) return - 0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
        return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
    };

    var BackIn = function (k) {
        var s = 1.70158;
        return k * k * ((s + 1) * k - s);
    };

    var BackOut = function (k) {
        var s = 1.70158;
        return --k * k * ((s + 1) * k + s) + 1;
    };

    var BackInOut = function (k) {
        var s = 1.70158 * 1.525;
        if ((k *= 2) < 1) return 0.5 * (k * k * ((s + 1) * k - s));
        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    };

    var BounceOut = function (k) {
        if (k < (1 / 2.75)) {
            return 7.5625 * k * k;
        } else if (k < (2 / 2.75)) {
            return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
        } else if (k < (2.5 / 2.75)) {
            return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
        }
        return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;

    };

    var BounceIn = function (k) {
        return 1 - BounceOut(1 - k);
    };

    var BounceInOut = function (k) {
        if (k < 0.5) return BounceIn(k * 2) * 0.5;
        return BounceOut(k * 2 - 1) * 0.5 + 0.5;
    };

    return {
        TweenManager: TweenManager,
        Tween: Tween,
        Linear: Linear,
        QuadraticIn: QuadraticIn,
        QuadraticOut: QuadraticOut,
        QuadraticInOut: QuadraticInOut,
        CubicIn: CubicIn,
        CubicOut: CubicOut,
        CubicInOut: CubicInOut,
        QuarticIn: QuarticIn,
        QuarticOut: QuarticOut,
        QuarticInOut: QuarticInOut,
        QuinticIn: QuinticIn,
        QuinticOut: QuinticOut,
        QuinticInOut: QuinticInOut,
        SineIn: SineIn,
        SineOut: SineOut,
        SineInOut: SineInOut,
        ExponentialIn: ExponentialIn,
        ExponentialOut: ExponentialOut,
        ExponentialInOut: ExponentialInOut,
        CircularIn: CircularIn,
        CircularOut: CircularOut,
        CircularInOut: CircularInOut,
        BackIn: BackIn,
        BackOut: BackOut,
        BackInOut: BackInOut,
        BounceIn: BounceIn,
        BounceOut: BounceOut,
        BounceInOut: BounceInOut,
        ElasticIn: ElasticIn,
        ElasticOut: ElasticOut,
        ElasticInOut: ElasticInOut
    };
}());

// Expose prototype methods and create a default tween manager on the application
(function () {
    // Add pc.Application#addTweenManager method
    pc.Application.prototype.addTweenManager = function () {
        this._tweenManager = new pc.TweenManager(this);

        this.on("update", function (dt) {
            this._tweenManager.update(dt);
        });
    };

    // Add pc.Application#tween method
    pc.Application.prototype.tween = function (target) {
        return new pc.Tween(target, this._tweenManager);
    };
    
        
    pc.Application.prototype.stopAllTweens = function (target) {
        for(var i = this._tweenManager._tweens.length - 1; i > -1; i--) {
            if(this._tweenManager._tweens[i].entity === target) {
                this._tweenManager._tweens[i].stop();
            }
        }
    };

    // Add pc.Entity#tween method
    pc.Entity.prototype.tween = function (target, options) {
        var tween = this._app.tween(target);
        tween.entity = this;

        this.once('destroy', tween.stop, tween);

        if (options && options.element) {
            // specifiy a element property to be updated
            tween.element = options.element;
        }
        return tween;
    };

    // Create a default tween manager on the application
    var application = pc.Application.getApplication();
    if (application) {
        application.addTweenManager();
    }
})();

// buildings.js
var Buildings = pc.createScript('buildings');

// initialize code called once per entity
Buildings.prototype.initialize = function() {
    this.BUILDING_LEN = 20;
    
    this.buildingTemplates = this.app.assets.findByTag('building');
    
    var onEnable = function () {
            this.reset();
        }.bind(this);
    
    this.on('enable', onEnable);
    
    this.acceleration = cr.Storage.acceleration;
    
    onEnable();
};

Buildings.prototype.reset = function () {
    if (this.buildings)
        this.buildings.forEach(building => building.destroy());
    
    this.buildings = [];

    for (var i = 0; i < 15; i++) {
        this.createBuilding(i % 2);
    }
};

Buildings.prototype.createBuilding = function (dir) {
    var newBuilding,
        buildingPos,
        buildingRot;
    
    newBuilding = cr.Utils.getRandomValue(this.buildingTemplates).resource.instantiate();
    
    this.entity.addChild(newBuilding);
    
    newBuilding.enabled = true;
    
    buildingPos = newBuilding.getPosition();
    buildingPos.x += this.buildings.length * this.BUILDING_LEN;
    buildingPos.y += cr.Utils.getRandomInt(-30, 10);
    buildingPos.z = cr.Utils.getRandomInt(25, 40) * (dir ? 1 : -1);
    
    buildingRot = newBuilding.getLocalEulerAngles();
    buildingRot.y = 90 * (cr.Utils.getRandomInt(0, 3));
    
    newBuilding.setPosition(buildingPos);
    newBuilding.setLocalEulerAngles(buildingRot);
    
    this.buildings.push(newBuilding);
};

// update code called every frame
Buildings.prototype.update = function(dt) {
    var firstBuilding = this.buildings[0],
        fBuildingPos = firstBuilding.getPosition();

    this.buildings.forEach(function (building, index) {
        building.translate(-dt * this.acceleration.velocity * 0.5, 0, 0);
    }.bind(this));

    if (0 > (fBuildingPos.x + this.BUILDING_LEN)) {
        firstBuilding.translate(this.buildings.length * this.BUILDING_LEN, 0, 0);

        this.buildings.push(this.buildings.shift());
    }
};

// hinge-constraint.js
var HingeConstraint = pc.createScript('hingeConstraint');

HingeConstraint.attributes.add('pivotA', {
    title: 'Pivot',
    description: 'Position of the constraint in the local space of this entity.',
    type: 'vec3',
    default: [0, 0, 0]
});
HingeConstraint.attributes.add('axisA', {
    title: 'Axis',
    description: 'Axis of rotation of the constraint in the local space this entity.',
    type: 'vec3',
    default: [0, 1, 0]
});
HingeConstraint.attributes.add('entityB', {
    title: 'Connected Entity',
    description: 'Optional second connected entity.',
    type: 'entity'
});
HingeConstraint.attributes.add('pivotB', {
    title: 'Connected Pivot',
    description: 'Position of the constraint in the local space of the connected entity (if specified).',
    type: 'vec3',
    default: [0, 0, 0]
});
HingeConstraint.attributes.add('axisB', {
    title: 'Connected Axis',
    description: 'Axis of rotation of the constraint in the local space of the connected entity (if specified).',
    type: 'vec3',
    default: [0, 1, 0]
});
HingeConstraint.attributes.add('limits', {
    title: 'Limits',
    description: 'Low and high angular limits for the constraint in degrees. By default, low is greater than high meaning no limits.',
    type: 'vec2',
    default: [1, -1]
});
HingeConstraint.attributes.add('softness', {
    title: 'Softness',
    description: 'Softness of the constraint. Recommend 0.8 to 1. Describes the percentage of limits where movement is free. Beyond this softness percentage, the limit is gradually enforced until the "hard" (1.0) limit is reached.',
    type: 'number',
    min: 0,
    max: 1,
    default: 0.9
});
HingeConstraint.attributes.add('biasFactor', {
    title: 'Bias Factor',
    description: 'Bias factor of the constraint. Recommend 0.3 +/- approximately 0.3. Strength with which constraint resists zeroth order (angular, not angular velocity) limit violation.',
    type: 'number',
    min: 0,
    max: 1,
    default: 0.3
});
HingeConstraint.attributes.add('relaxationFactor', {
    title: 'Relaxation Factor',
    description: 'Relaxation factor of the constraint. Recommend to keep this near 1. The lower the value, the less the constraint will fight velocities which violate the angular limits.',
    type: 'number',
    min: 0,
    max: 1,
    default: 1
});
HingeConstraint.attributes.add('enableMotor', {
    title: 'Use Motor',
    description: 'Enable a motor to power the automatic rotation around the hinge axis.',
    type: 'boolean',
    default: false
});
HingeConstraint.attributes.add('motorTargetVelocity', {
    title: 'Target Velocity',
    description: 'Target motor angular velocity.',
    type: 'number',
    default: 0
});
HingeConstraint.attributes.add('maxMotorImpulse', {
    title: 'Max Motor Impulse',
    description: 'Maximum motor impulse.',
    type: 'number',
    default: 0
});
HingeConstraint.attributes.add('breakingThreshold', {
    title: 'Break Threshold',
    description: 'Maximum breaking impulse threshold required to break the constraint.',
    type: 'number',
    default: 3.4e+38
});
HingeConstraint.attributes.add('enableCollision', {
    title: 'Enable Collision',
    description: 'Enable collision between linked rigid bodies.',
    type: 'boolean',
    default: true
});
HingeConstraint.attributes.add('debugRender', {
    title: 'Debug Render',
    description: 'Enable to render a representation of the constraint.',
    type: 'boolean',
    default: false
});
HingeConstraint.attributes.add('debugColor', {
    title: 'Debug Color',
    description: 'The color of the debug rendering of the constraint.',
    type: 'rgb',
    default: [1, 0, 0]
});

// initialize code called once per entity
HingeConstraint.prototype.initialize = function() {
    this.createConstraint();

    this.on('attr', function(name, value, prev) {
        // If any constraint properties change, recreate the constraint
        if (name === 'pivotA' || name === 'axisA' || name === 'entityB' || name === 'pivotB' || name === 'axisB') {
            this.createConstraint();
        } else if (name === 'limits' || name === 'softness' || name === 'biasFactor' || name === 'relaxationFactor') {
            // setLimit takes angles in radians
            var low = this.limits.x * Math.PI / 180;
            var high = this.limits.y * Math.PI / 180;
            this.constraint.setLimit(low, high, this.softness, this.biasFactor, this.relaxationFactor);
        } else if (name === 'enableMotor' || name === 'motorTargetVelocity' || name === 'maxMotorImpulse') {
            this.constraint.enableAngularMotor(this.enableMotor, this.motorTargetVelocity * Math.PI / 180, this.maxMotorImpulse);
            this.activate();
        } else if (name === 'breakingThreshold') {
            this.constraint.setBreakingImpulseThreshold(this.breakingThreshold);
            this.activate();
        }
    });
    this.on('enable', function () {
        this.createConstraint();
    });
    this.on('disable', function () {
        this.destroyConstraint();
    });
    this.on('destroy', function () {
        this.destroyConstraint();
    });
};

HingeConstraint.prototype.createConstraint = function() {
    if (this.constraint) {
        this.destroyConstraint();
    }

    var v1 = new pc.Vec3();
    var v2 = new pc.Vec3();
    var q = new pc.Quat();
    var m = new pc.Mat4();

    var bodyA = this.entity.rigidbody.body;
    var pivotA = new Ammo.btVector3(this.pivotA.x, this.pivotA.y, this.pivotA.z);

    cr.Utils.getOrthogonalVectors(this.axisA, v1, v2);
    m.set([
        v1.x, v1.y, v1.z, 0,
        v2.x, v2.y, v2.z, 0,
        this.axisA.x, this.axisA.y, this.axisA.z, 0,
        0, 0, 0, 1
    ]);
    q.setFromMat4(m);

    var quatA = new Ammo.btQuaternion(q.x, q.y, q.z, q.w);
    var frameA = new Ammo.btTransform(quatA, pivotA);

    if (this.entityB && this.entityB.rigidbody) {
        var bodyB = this.entityB.rigidbody.body;
        var pivotB = new Ammo.btVector3(this.pivotB.x, this.pivotB.y, this.pivotB.z);

        cr.Utils.getOrthogonalVectors(this.axisB, v1, v2);
        m.set([
            v1.x, v1.y, v1.z, 0,
            v2.x, v2.y, v2.z, 0,
            this.axisB.x, this.axisB.y, this.axisB.z, 0,
            0, 0, 0, 1
        ]);
        q.setFromMat4(m);

        var quatB = new Ammo.btQuaternion(q.x, q.y, q.z, q.w);
        var frameB = new Ammo.btTransform(quatB, pivotB);

        this.constraint = new Ammo.btHingeConstraint(bodyA, bodyB, frameA, frameB, false);

        Ammo.destroy(frameB);
        Ammo.destroy(quatB);
        Ammo.destroy(pivotB);
    } else {
        this.constraint = new Ammo.btHingeConstraint(bodyA, frameA, false);
    }

    var low = this.limits.x * Math.PI / 180;
    var high = this.limits.y * Math.PI / 180;
    this.constraint.setLimit(low, high, this.softness, this.biasFactor, this.relaxationFactor);
    this.constraint.setBreakingImpulseThreshold(this.breakingThreshold);
    this.constraint.enableAngularMotor(this.enableMotor, this.motorTargetVelocity * Math.PI / 180, this.maxMotorImpulse);

    Ammo.destroy(frameA);
    Ammo.destroy(quatA);
    Ammo.destroy(pivotA);

    var dynamicsWorld = this.app.systems.rigidbody.dynamicsWorld;
    dynamicsWorld.addConstraint(this.constraint, !this.enableCollision);

    this.activate();
};

HingeConstraint.prototype.destroyConstraint = function() {
    if (this.constraint) {
        var dynamicsWorld = this.app.systems.rigidbody.dynamicsWorld;
        dynamicsWorld.removeConstraint(this.constraint);
        Ammo.destroy(this.constraint);
        this.constraint = null;
    }
};

HingeConstraint.prototype.activate = function() {
    this.entity.rigidbody.activate();
    if (this.entityB) {
        this.entityB.rigidbody.activate();
    }
};

// update code called every frame
HingeConstraint.prototype.update = function(dt) {
    if (this.debugRender) {
        // Note that it's generally bad to allocate new objects in an update function
        // but this is just for debug rendering and will normally be disabled
        var tempVecA = new pc.Vec3();
        var tempVecB = new pc.Vec3();
        var tempVecC = new pc.Vec3();
        var tempVecD = new pc.Vec3();
        var worldTransform = this.entity.getWorldTransform();
        worldTransform.transformPoint(this.pivotA, tempVecA);
        worldTransform.transformVector(this.axisA, tempVecB);

        tempVecB.normalize().scale(0.5);
        tempVecC.add2(tempVecA, tempVecB);
        tempVecD.sub2(tempVecA, tempVecB);

        this.app.renderLine(this.entity.getPosition(), tempVecA, this.debugColor);
        this.app.renderLine(tempVecC, tempVecD, this.debugColor);

        if (this.entityB) {
            this.app.renderLine(this.entityB.getPosition(), tempVecA, this.debugColor);
        }
    }
};

// animate-rotation-curve.js
var AnimateRotationCurve = pc.createScript('animateRotationCurve');

// Example of creating curve attribute with multiple curves (in this case, x, y, z)
AnimateRotationCurve.attributes.add("offsetCurve", {type: "curve", title: "Offset Curve", curves: [ 'x', 'y', 'z' ]});
AnimateRotationCurve.attributes.add("duration", {type: "number", default: 3, title: "Duration (secs)"});


// initialize code called once per entity
AnimateRotationCurve.prototype.initialize = function() {
    // Store the original rotation of the entity so we can offset from it
    this.startRotation = this.entity.getLocalEulerAngles().clone();
    
    // Keep track of the current rotation
    this.rotation = new pc.Vec3();
    
    this.time = 0;
};


// update code called every frame
AnimateRotationCurve.prototype.update = function (dt) {
    this.time += dt;
    
    // Loop the animation forever
    if (this.time > this.duration) {
        this.time -= this.duration;
    }
    
    // Calculate how far in time we are for the animation
    this.percent = this.time / this.duration;
    
    // Get curve values using current time relative to duration (percent)
    // The offsetCurve has 3 curves (x, y, z) so the returned value will be a set of 
    // 3 values
    this.curveValue = this.offsetCurve.value(this.percent);
    
    // Create our new rotation from the startRotation and curveValue
    this.rotation.copy(this.startRotation);
    this.rotation.x += this.curveValue[0];
    this.rotation.y += this.curveValue[1];
    this.rotation.z += this.curveValue[2];
    
    this.entity.setLocalEulerAngles(this.rotation);
};


// start-screen.js
var StartScreen = pc.createScript('startScreen');

StartScreen.attributes.add("moneyTotal", {type: "entity"});
StartScreen.attributes.add("muteButton", {type: "entity"});
StartScreen.attributes.add("unitsAmount", {type: "entity"});
StartScreen.attributes.add("upgradeCost", {type: "entity"});
StartScreen.attributes.add("coinsIncome", {type: "entity"});
StartScreen.attributes.add("stickmanUpgradeBtn", {type: "entity"});
StartScreen.attributes.add("incomeUpgradeBtn", {type: "entity"});

// initialize code called once per entity
StartScreen.prototype.initialize = function() {
    var buttons = [this.stickmanUpgradeBtn.script.upgradeButton, this.incomeUpgradeBtn.script.upgradeButton],
    
        getStickmanUpgradeCost = function () {
            return 50 * cr.Storage.unitNumber;
        },
        
        getIncomeUpgradeCost = function () {
            return 50 * cr.Storage.unitIncome;
        },
    
        onEnable = function () {
            this.moneyTotal.script.animateNumber.set(cr.Storage.totalCash);
            
            buttons.forEach(buttonScript => buttonScript.ad = false);
            
            if (Apicontroller.hasRewardedVideo())
                cr.Utils.getRandomValue(buttons).ad = true;
            
            updateButtons();
        }.bind(this),
        
        updateButtons = function () {
            this.stickmanUpgradeBtn.script.upgradeButton.upgradeCost = getStickmanUpgradeCost();
            this.incomeUpgradeBtn.script.upgradeButton.upgradeCost = getIncomeUpgradeCost();
            
            this.stickmanUpgradeBtn.script.upgradeButton.value.element.text = "+1"; //cr.Storage.unitNumber;
            this.incomeUpgradeBtn.script.upgradeButton.value.element.text = cr.Storage.unitIncome;
        }.bind(this),
        
        substractMoney = function (upgradeCost) {
            cr.Storage.totalCash -= upgradeCost;
            cr.Utils.setStorageItem(cr.Keys.STORAGE_KEYS.CASH, cr.Storage.totalCash);
            
            this.moneyTotal.script.animateNumber.set(cr.Storage.totalCash);
        }.bind(this),
    
        upgradeStickman = function () {
            cr.Storage.unitNumber++;
            cr.Utils.setStorageItem(cr.Keys.STORAGE_KEYS.UNUM, cr.Storage.unitNumber);

            this.app.fire(cr.Events.CROWD_SPAWN, { multiply: false,
                                                   value: 1 });

            updateButtons();
        }.bind(this),
        
        upgradeIncome = function () {
            cr.Storage.unitIncome++;
            cr.Utils.setStorageItem(cr.Keys.STORAGE_KEYS.UINC, cr.Storage.unitIncome);

            updateButtons();
        }.bind(this),
    
        onStickmanUpgradeBtn = function () {
            if (this.showingAd)
                return;
            
            if (this.stickmanUpgradeBtn.script.upgradeButton.ad) {
                this.stickmanUpgradeBtn.script.upgradeButton.ad = false;
                
                if (!Apicontroller.hasRewardedVideo())
                    return;
                
                this.showingAd = true;
                
                Apicontroller.showRewardedVideo((result) => {
                    if (result.rewardGranted)
                       upgradeStickman();

                    this.showingAd = false;
                });
                
                return;
            }
            
            var upgradeCost = getStickmanUpgradeCost();
            
            if (cr.Storage.totalCash < upgradeCost)
                return;
            
            substractMoney(upgradeCost);
            
            upgradeStickman();
        }.bind(this),
    
        onIncomeUpgradeBtn = function () {
            if (this.showingAd)
                return;
            
            if (this.incomeUpgradeBtn.script.upgradeButton.ad) {
                this.incomeUpgradeBtn.script.upgradeButton.ad = false;
                
                if (!Apicontroller.hasRewardedVideo())
                    return;

                this.showingAd = true;
                
                Apicontroller.showRewardedVideo((result) => {
                    if (result.rewardGranted)
                        upgradeIncome();

                    this.showingAd = false;
                });
                
                return;
            }
            
            var upgradeCost = getIncomeUpgradeCost();
            
            if (cr.Storage.totalCash < upgradeCost)
                return;
            
            substractMoney(upgradeCost);
            
            upgradeIncome();
        }.bind(this);
    
    this.stickmanUpgradeBtn.element.on('click', onStickmanUpgradeBtn);
    this.incomeUpgradeBtn.element.on('click', onIncomeUpgradeBtn);
    
    this.on('enable', onEnable);
    
    onEnable();
};

// update code called every frame
StartScreen.prototype.update = function(dt) {
    if (isExternalMute()) {
        this.muteButton.enabled = false;
    }
};

// sound-settings.js
var SoundSettings = pc.createScript('soundSettings');

SoundSettings.attributes.add('muteIcon', {type: 'entity'});

// initialize code called once per entity
SoundSettings.prototype.initialize = function() {
    var onSoundChanged = function () {
            cr.Utils.setStorageItem(cr.Keys.STORAGE_KEYS.SOUND, cr.Storage.sound);
        
            cr.SoundController.play(cr.Keys.SOUNDS.BUTTON_CLICK);

            window.famobi_analytics.trackEvent("EVENT_VOLUMECHANGE", 
                                           {bgmVolume: Number(cr.Storage.sound.music), sfxVolume: Number(cr.Storage.sound.sfx)});
        }.bind(this),
        
        updateSfx = function () {
            cr.SoundController.enabled = cr.Storage.sound.sfx;

            this.muteIcon.enabled = !cr.Storage.sound.sfx;
        }.bind(this),
        
        onEnable = function () {
            updateSfx();
        }.bind(this);
    
    this.entity.element.on('click', function (event) {
        cr.Storage.sound.sfx = !cr.Storage.sound.sfx;
        
        updateSfx();
        onSoundChanged();
        
        this.app.fire(cr.Events.SOUND_SFX);
    }.bind(this), this);
    
    this.on('enable', onEnable);
    
    this.app.on(cr.Events.API_ENABLE_AUDIO, updateSfx);
    this.app.on(cr.Events.API_DISABLE_AUDIO, updateSfx);
    //this.app.on(cr.Events.API_ENABLE_MUSIC, updateMusic);
    //this.app.on(cr.Events.API_DISABLE_MUSIC, updateMusic);
    
    onEnable();
};

// shadow.js
var Shadow = pc.createScript('shadow');

// initialize code called once per entity
Shadow.prototype.initialize = function() {
    this.image = this.entity.findByName('Image');
    this.noRaycast = 0;
};

// update code called every frame
Shadow.prototype.update = function(dt) {
    let pos = this.entity.getPosition(),
        parentPos = this.entity.parent.getPosition(),
        start = parentPos,
        end = new pc.Vec3(parentPos.x, parentPos.y - 10, parentPos.z),
        raycastResult = pc.app.systems.rigidbody.raycastFirst(start, end);
    
    this.image.enabled = !!raycastResult || this.noRaycast < 2;
    
    if (raycastResult) {
        this.noRaycast = 0;
        pos.y = raycastResult.point.y + 0.05;
        this.entity.setPosition(pos);
    } else {
        this.noRaycast++;
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// Shadow.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// revive-screen.js
var ReviveScreen = pc.createScript('reviveScreen');

ReviveScreen.attributes.add("watchAdBtn", {type: "entity"});
ReviveScreen.attributes.add("continueBtn", {type: "entity"});

// initialize code called once per entity
ReviveScreen.prototype.initialize = function() {
    var restart = function () {
            window.famobi_analytics.trackEvent("EVENT_LEVELRESTART", {levelName: '' + cr.Storage.currentMission});
            cr.SoundController.play(cr.Keys.SOUNDS.LEVEL_FAIL);
            this.app.fire(cr.Events.GAME_RESTART);
        },
    
        onRestartBtn = function () {
            Promise.all([
                window.famobi_analytics.trackEvent(
                    "EVENT_LEVELFAIL",
                    {
                        levelName: '' + cr.Storage.currentMission,
                        reason: 'dead'
                    }
                ),
                window.famobi_analytics.trackEvent(
                    "EVENT_LEVELSCORE",
                    {
                        levelName: '' +  cr.Storage.currentMission,
                        levelScore: Math.floor(cr.Storage.distance || 0)
                    }
                ),
                window.famobi.showInterstitialAd()
            ]).then(restart.bind(this), restart.bind(this));
        }.bind(this),
        
        continueGame = function () {
            if (!Apicontroller.hasRewardedVideo() || this.showingAd)
                return;
                
            Apicontroller.showRewardedVideo((result) => {
                if (result.rewardGranted) {
                    cr.SoundController.play(cr.Keys.SOUNDS.REVIVE);
                    this.app.fire(cr.Events.CROWD_SPAWN, { multiply: false,
                                                           value: cr.Storage.unitNumber });
                    this.app.fire(cr.Events.CROWD_JUMP, true);
                    this.app.fire(cr.Events.GAME_RESUME);
                }
                
                this.showingAd = false;
            });
            
        }.bind(this);
    
    this.continueBtn.element.on('click', onRestartBtn);
    this.watchAdBtn.element.on('click', continueGame);
};

// hummer-tween.js
var HummerTween = pc.createScript('hummerTween');

HummerTween.attributes.add("shadow", {type: "entity"});

// initialize code called once per entity
HummerTween.prototype.initialize = function() {
    this.dynamicCollisions = this.entity.findByTag('dynamic_collision');
    this.angles = this.entity.getLocalEulerAngles().clone();
    this.setDcEnabled(true);
    
    setTimeout(this.set.bind(this), cr.Utils.getRandomInt(0, 1500));
};

HummerTween.prototype.set = function () {
    this.entity
        .tween(this.angles)
        .to({x: 90, y: 0, z: 0}, 0.7, pc.QuadraticInOut)
        .delay(0.5)
        .on('update', this.updateAngles.bind(this))
        .on('complete', this.smash.bind(this))
        .start();
};

HummerTween.prototype.smash = function () {
    this.playHit = true;
    
    this.entity
        .tween(this.angles)
        .to({x: 0, y: 0, z: 0}, 1, pc.BounceOut)
        .delay(0.5)
        .on('update', this.updateAngles.bind(this))
        .on('complete', this.set.bind(this))
        .start();
};

HummerTween.prototype.setDcEnabled = function (val) {
    this.dynamicCollisions.forEach(dc => dc.collision.enabled = val);
    this.dcEnabled = val;
};

HummerTween.prototype.updateAngles = function (dt) {
    var normalized = 1 - cr.Utils.normalize(0, 90, this.angles.x);
    
    this.entity.setLocalEulerAngles(this.angles);
    this.shadow.setLocalScale(normalized, 1, normalized);
    
    if (this.angles.x < 1 && this.playHit) {
        cr.SoundController.play(cr.Keys.SOUNDS.HUMMER_HIT);
        this.playHit = false;
    }
    
    if (this.angles.x < 30 && !this.dcEnabled)
        this.setDcEnabled(true);
    else if (this.angles.x >= 30 && this.dcEnabled)
        this.setDcEnabled(false);
};

// update code called every frame
HummerTween.prototype.update = function(dt) {
    
};


// progress-bar.js
var ProgressBar = pc.createScript('progressBar');

ProgressBar.attributes.add("currentLevel", {type: "entity"});
ProgressBar.attributes.add("nextLevel", {type: "entity"});
ProgressBar.attributes.add("pointer", {type: "entity"});
ProgressBar.attributes.add("nextLevelGreyed", {type: "entity"});
ProgressBar.attributes.add("levelProgress", {type: "entity"});
ProgressBar.attributes.add("levelProgressBg", {type: "entity"});
ProgressBar.attributes.add("pauseBtn", {type: "entity"});

// initialize code called once per entity
ProgressBar.prototype.initialize = function() {
    var updateNumbers = function () {
            this.currentLevel.element.text = cr.Storage.currentMission;
            this.nextLevel.element.text = cr.Storage.currentMission + 1;
        }.bind(this),
        
        onEnable = function () {
            this.pauseBtn.enabled = true;
            
            updateNumbers();

            if (this.anim)
                this.anim.stop();
            
            this.nextLevelGreyed.element.opacity = 1;
        }.bind(this),
        
        onGameOver = function () {
            this.pauseBtn.enabled = false;
            
            if (cr.Storage.gameState == cr.Keys.GAME_STATES.PASSED)
                this.anim = this.nextLevelGreyed
                                .tween(this.nextLevelGreyed.element)
                                .to({opacity: 0}, 1, pc.Linear)
                                .start();
        }.bind(this);
    
    this.app.on(cr.Events.GAME_OVER, onGameOver);
    this.on('enable', onEnable);
    
    onEnable();
};

// update code called every frame
ProgressBar.prototype.update = function(dt) {
    var posX = (cr.Storage.distance / cr.Storage.mission.distance) * this.levelProgressBg.element.width,
        pointerPos = this.pointer.getLocalPosition();
    
    this.levelProgress.element.width = posX;
    pointerPos.x = posX;
    this.pointer.setLocalPosition(pointerPos);
    
    if (isExternalPause()) {
        this.pauseBtn.enabled = false;
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// ProgressBar.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// upgrade-button.js
var UpgradeButton = pc.createScript('upgradeButton');

UpgradeButton.attributes.add("greyed", {type: "entity"});
UpgradeButton.attributes.add("coinGreyed", {type: "entity"});
UpgradeButton.attributes.add("value", {type: "entity"});
UpgradeButton.attributes.add("price", {type: "entity"});
UpgradeButton.attributes.add("iconCoin", {type: "entity"});
UpgradeButton.attributes.add("iconAd", {type: "entity"});
UpgradeButton.attributes.add("iconAdGreyed", {type: "entity"});

// initialize code called once per entity
UpgradeButton.prototype.initialize = function() {
    
};

Object.defineProperty(UpgradeButton.prototype, "ad", {
    get: function() {
        return this._ad;
    },

    set: function(val) {
        this._ad = val;
        this._updateActive();
    }
});

Object.defineProperty(UpgradeButton.prototype, "upgradeCost", {
    get: function() {
        return this._upgradeCost;
    },

    set: function(val) {
        this._upgradeCost = val;
        this.price.element.text = val;
        this._updateActive();
    }
});

Object.defineProperty(UpgradeButton.prototype, "active", {
    get: function() {
        return this._active;
    },

    set: function(val) {
        this._active = val;
        this._updateState();
    }
});

UpgradeButton.prototype._updateActive = function () {
    this.active = (cr.Storage.totalCash >= this._upgradeCost) || this.ad;
};

UpgradeButton.prototype._updateState = function () {
        this.greyed.enabled = !this.active;
        this.iconAd.enabled = this.ad;
        this.iconAdGreyed.enabled = !this.active && this.ad;
        this.coinGreyed.enabled = !this.active && !this.ad;
        this.price.enabled = !this.ad;
        this.iconCoin.enabled = !this.ad;
        this.entity.element.useInput = this.active || this.ad;
};

// update code called every frame
UpgradeButton.prototype.update = function(dt) {
    
};

// clouds.js
var Clouds = pc.createScript('clouds');

Clouds.attributes.add("cloudScale", {
    type: "vec2",
    default: [0.8, 1.8]
});

Clouds.attributes.add("speedScale", {
    type: "vec2",
    default: [0.3, 1]
});

Clouds.attributes.add("windSpeed", {
    type: "vec2",
    default: [0.3, 0.7]
});

// initialize code called once per entity
Clouds.prototype.initialize = function() {
    this.CLOUD_NUM = 10;
    
    var cloud,
        
        onEnable = function () {
            var scale;
            
            this.levelWindSpeed = -cr.Utils.getRandomNumber(this.windSpeed.x, this.windSpeed.y);
            this.cloudsLen = 0;
                
            this.clouds.forEach(function (cloud, index) {
                scale = cr.Utils.getRandomNumber(this.cloudScale.x, this.cloudScale.y);
                
                cloud.setLocalEulerAngles(cloud.initEulers.x, 
                                          (index % 2 ? 0 : 180),
                                          cloud.initEulers.z);

                cloud.setLocalScale(cloud.initScale.x * scale,
                                    cloud.initScale.y * scale * 3,
                                    cloud.initScale.z);
                
                cloud.velX = cr.Utils.getRandomNumber(this.speedScale.x, this.speedScale.y);
                cloud.aabb = cloud.sprite._meshInstance.aabb;
                
                cloud.setPosition(cloud.initPos.x + cr.Utils.getRandomInt(-10, 10) + this.cloudsLen, 
                                  cr.Utils.getRandomInt(cloud.initPos.y - 50, cloud.initPos.y), 
                                  cloud.aabb.halfExtents.z * 0.8 * (index % 2 ? 1 : -1));
                
                this.cloudsLen += cloud.aabb.halfExtents.x / 3;
            }.bind(this));
        }.bind(this);
    
    this.clouds = [];
    this.acceleration = cr.Storage.acceleration;
    this.cloudTemplate = this.app.assets.find('Cloud', 'template');
    
    for (var i = 0; i < this.CLOUD_NUM; i++) {
        cloud = this.cloudTemplate.resource.instantiate();
        
        this.entity.addChild(cloud);
        
        cloud.enabled = true;
        cloud.initEulers = cloud.getLocalEulerAngles().clone();
        cloud.initPos = cloud.getPosition().clone();
        cloud.initScale = cloud.getLocalScale().clone();
        cloud.sprite._meshInstance.material.depthTest = false;
        
        this.clouds.push(cloud);
    }
    
    this.cloudOpacity = this.clouds[0].sprite.opacity;
    this.on('enable', onEnable);
    
    onEnable();
};

// update code called every frame
Clouds.prototype.update = function(dt) {
    var cloud;
    
    for (var i = 0; i < this.clouds.length; i++) {
        cloud = this.clouds[i];
        
        if (cloud.getPosition().x < -cloud.aabb.halfExtents.x) {
            cloud.translate(this.cloudsLen, 0, 0);
            cloud.sprite.opacity = 0;
        } else { 
            cloud.translate((-cloud.velX * this.acceleration.velocity + this.levelWindSpeed) * dt, 0, 0);
            
            if (cloud.sprite.opacity < this.cloudOpacity)
                cloud.sprite.opacity = Math.min(this.cloudOpacity, cloud.sprite.opacity + 0.1 * dt);
        }
    }
};


// Apicontroller.js
/* jshint esversion: 6 */
var Apicontroller = pc.createScript('apicontroller');

Apicontroller.FAMOBI_TRACKING_KEY = 'crowd-run-3d';

Apicontroller.prototype.initialize = function() {
    famobi.log('Famobi API controller initialized');
    
    Apicontroller.initTracking();
};

Apicontroller.prototype.update = function(dt) {
    //make sure the game is paused 
    if (this.app.applicationPaused) {
        this.app.timeScale = 0;
    }
};

Apicontroller.initTracking = function() {
    if(!window.famobi_tracking) {
        console.warn("Tracking API is not defined");
        return;
    }
    window.famobi_tracking.init(Apicontroller.FAMOBI_TRACKING_KEY, null, 100, true, true);
    console.log('Tracking API initialized with key ' + Apicontroller.FAMOBI_TRACKING_KEY);
};

Apicontroller.trackLevelStart = function(eventParams) {
    if(!window.famobi_tracking) {
        console.warn("TrackLevelStart: Tracking API is not defined");
        return;
    }
    window.famobi_tracking.trackEvent(window.famobi_tracking.EVENTS.LEVEL_START, eventParams);
};


Apicontroller.trackLevelEnd = function(eventParams) {
    if(!window.famobi_tracking) {
        console.warn("TrackLevelEnd: Tracking API is not defined");
        return;
    }
    window.famobi_tracking.trackEvent(window.famobi_tracking.EVENTS.LEVEL_END, eventParams);
};

Apicontroller.handleLevelEndEvent = function(result, score, resolveCallback) {
    if(!window.famobi) {
        resolveCallback();
        return;
    }
    
    const currentTimeScale = game.timeScale;
    game.timeScale = 0.0;    
    
    window.famobi_analytics.trackEvent("EVENT_CUSTOM", {eventName: "LEVELEND", result: result, score: score})
        .then(() => {
            game.timeScale = currentTimeScale;
            resolveCallback();
        }).catch(() => {
    
        });
};

/* Rewarded videos ads */


Apicontroller.hasRewardedVideo = function() {
    if (window.famobi && window.famobi.hasRewardedAd)
        return window.famobi.hasRewardedAd();
    else
        return false;
};

Apicontroller.showRewardedVideo = function(callback) {
    if(!window.famobi) callback({rewardGranted: false});
    
    if (window.famobi && Apicontroller.hasRewardedVideo()) {
        window.famobi.rewardedAd(callback);
    } else {
        callback({rewardGranted: false});
    }
};



/* Tracking stats */

Apicontroller.trackStats = function(...args) {
    if(window.famobi_analytics && window.famobi_analytics.trackStats) {
        window.famobi_analytics.trackStats(...args);
    }
};



// branding-image.js
var BrandingImage = pc.createScript('brandingImage');

BrandingImage.prototype.initialize = function() {
    
    this.entity.element.opacity = 0.0;
    
    if (window.famobi) {
        var self = this;
        this.app.loader.getHandler("texture").crossOrigin = "anonymous";

        var asset = new pc.Asset("brandingImage", "texture", {
            url: window.famobi.getBrandingButtonImage()
        });

        this.app.assets.add(asset);

        asset.on("error", function (message) {
            famobi.log("Branding image loading failed: ", message);
        });

        asset.on("load", function (asset) {
            var material = self.entity.element.texture = asset.resource;
            self.entity.element.opacity = 1;
            self.assignAction(self.entity, self.brandingPressed, self);
        });

        this.app.assets.load(asset);
    }
    
    this.app.graphicsDevice.on('resizecanvas', this.onCanvasResize, this);
    this.onCanvasResize();
};



BrandingImage.prototype.assignAction = function(button, handler, handlerContext) {
     if (this.app.touch) {
         button.element.on('touchstart', handler, handlerContext);
     }
    
     if (this.app.mouse) {
          button.element.on('mousedown', handler, handlerContext);
     }
};

BrandingImage.prototype.onCanvasResize = function () {
    const screenRatio = this.app.graphicsDevice.width / this.app.graphicsDevice.height;
    
    if (screenRatio < 0.95) {
        this.entity.element.anchor.set(0.5, 0, 0.5, 0);
        this.entity.setLocalPosition(0, 300, 0);
    } else {
        this.entity.element.anchor.set(1, 0, 1, 0);
        this.entity.setLocalPosition(-185, 90, 0);
    }
};

BrandingImage.prototype.swap = function(data) {

};

BrandingImage.prototype.brandingPressed = function() {
    if (window.famobi) {
        window.famobi.openBrandingLink();
    }
};


// copyright-text.js
var CopyrightText = pc.createScript('copyrightText');

CopyrightText.prototype.initialize = function() {
    this.entity.enabled = isCopyrightEnabled();
};

CopyrightText.prototype.update = function(dt) {
    
};


// LoadingScreen.js
 pc.script.createLoadingScreen(function (app) {
    var showSplash = function () {

        // splash wrapper
        var wrapper = document.createElement('div');
        wrapper.id = 'application-splash-wrapper';
        document.body.appendChild(wrapper);

        
        // splash
        var splash = document.createElement('div');
        splash.id = 'application-splash';
        wrapper.appendChild(splash);
        splash.style.display = 'block';
        
        var logo = document.createElement('img');
        logo.src = 'data:image/png;base64,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';
        logo.id = 'logo';
        splash.appendChild(logo);
        logo.onload = function () {
            splash.style.display = 'block';
        };
        
        var loaderBack = document.createElement('div');
        loaderBack.id = 'loaderBack';
        splash.appendChild(loaderBack);
        
        var loaderBar = document.createElement('div');
        loaderBar.id = 'loaderBar';
        loaderBack.appendChild(loaderBar);

        var loadingText = document.createElement('span');
        loadingText.innerHTML = '0%';
        loadingText.id = 'loadingText';
        loaderBack.appendChild(loadingText);

        /* do not allow click through the wrapper */
        ['mousedown', 'mouseup', 'mousemove', 'touchstart', 'touchmove', 'touchend'].forEach(evtKey => wrapper.addEventListener(evtKey, function(e) { e.stopPropagation(); e.preventDefault(); }));
    };

    var hideSplash = function () {
        var splash = document.getElementById('application-splash-wrapper');
        if(splash.parentElement) {
            splash.parentElement.removeChild(splash);
        }
    };

    var setProgress = function (value) {
        var bar = document.getElementById('loaderBar');
        var loadingText = document.getElementById('loadingText');
        if (bar) {
            value = Math.min(1, Math.max(0, value));
            const displayValue = value;
            bar.style.width = displayValue * 99 + '%';
            loadingText.innerHTML = Math.round(displayValue * 99) + '%';
        }
        const loadingProgressValue = value * 99; 
        if (window.famobi) {
            window.famobi.setPreloadProgress(Math.floor(loadingProgressValue));
        }
    };

    var createCss = function () {
        var css =
            `
            body {
                user-select: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                touch-action: none;
                -webkit-touch-action: none;
                -moz-touch-action: none;
                -ms-touch-action: none;
            }            
            
            #logo {
                position: relative;
            }


            #application-splash-wrapper {      
                background-color: #1A1A1A;
                background-repeat: no-repeat;
                background-position: center;
                background-size: cover;
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                z-index: 999;
            }
            
            #application-splash {
                position: absolute;
                height: 320px;
                width: 400px;
                left: calc(50% - 200px);
                bottom: calc(50% - 125px);
            }

            #loaderBack {
                left: calc(50% - 209px);
                bottom: -50px;
                height: 60px;
                width: 418px;
                position: absolute;
                background-image: url('data:image/png;base64,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');
                background-repeat: no-repeat;
                background-position: left center;
                background-size: 418px 100%;
                z-index: 10;
            }

            #application-splash img {
                width: 100%;
            }
            
            #loaderBar {
                bottom: 0;
                left: 2px; 
                height: 56px;
                width: 0%;
                position: absolute;
                background-image: url('data:image/png;base64,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');
                background-repeat: no-repeat;
                background-position: left center;
                background-size: 414px 100%;
                z-index: 10;
            }
            
            #loadingText {
                color: white;
                font-size: 38px;                
                font-weight: bold;
                line-height: 60px;
                bottom: 0;
                left: 0;
                right: 0;
                top: 0;
                margin: auto;
                position: absolute;
                text-align: center;
                z-index: 100;
            }
                  
            .hide {
               opacity: 0 !important;
               transition: opacity 0.3s ease-in;
            }

            @media (max-width: 480px), (max-height: 480px) {
                #application-splash {
                    height: 260px;
                    width: 280px;
                    left: calc(50% - 140px);
                    bottom: calc(50% - 130px);
                }

                #loaderBack {
                    height: 37px;
                    width: 261px;
                    left: calc(50% - 130px);
                    bottom: 0;
                    background-size: 261px 100%;
                }

                 #loaderBar {
                    bottom: 0;
                    left: 2px; 
                    height: 34px;
                    background-size: 258px 100%;
                 }
            
                 #loadingText {
                     font-size: 24px;
                     line-height: 37px;
                     bottom: 0;
                 }
            }
        `;

        var style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        document.head.appendChild(style);
    };

    var injectForcedModeProperties = function() {
        console.warn('Injecting forced mode properties...');
        const forcedModeProperties = getForcedModeProperties();
        if(forcedModeProperties.state.level) {
            //TODO inject proper forced mode level
        }
    };
        
    var doAPIHandshake = function(startGameCallback) {   
        if(isExternalStart()) {
            app.timeScale = 0;
            famobi.onRequest("startGame", function() {
                app.timeScale = 1.0;                               
                if(startGameCallback) startGameCallback();
            });
        } else {
            if(startGameCallback) startGameCallback();
        }
        
        /* game ready report */
        famobi.gameReady();
    };
     
    createCss();
    showSplash();

    app.on('preload:end', function () {
        app.off('preload:progress');       
    });
    app.on('preload:progress', setProgress);
    // app.on('start', hideSplash);
    app.on('start', function() {
        
        /* game is loaded, send final progress to Famobi API. */
        famobi.setPreloadProgress(100);
        
        /* inject forced mode properties if needed */
        if(isForcedMode()) {
            injectForcedModeProperties();
        }
        
        /* hide preloader */
        hideSplash();
        
        /* if "skip_title" feature is present, start the gameplay/level screen directly */
        if(skipTitleScreen()) {
            /* timeout is a must to let the game properly initialize level */
            setTimeout(() => doAPIHandshake(() => {
                famobi.log('Handshake completed, skip_title mode');
            }), 0);
        } else {
            /* timeout is a must to let the game properly initialize a level */
            setTimeout(() => doAPIHandshake(() => {
                famobi.log('Handshake completed in normal gameplay mode');
            }), 0);
            
        }   
        
    });
});

// pause.js
var Pause = pc.createScript('pause');

// initialize code called once per entity
Pause.prototype.initialize = function() {
    this.entity.element.on('click', function () {
        this.app.fire(cr.Events.GAME_PAUSE);
        window.famobi_analytics.trackEvent("EVENT_PAUSE");
    }.bind(this));
};

// resume.js
var Resume = pc.createScript('resume');

// initialize code called once per entity
Resume.prototype.initialize = function() {
    this.entity.element.on('click', function () {
        window.famobi_analytics.trackEvent("EVENT_RESUME").then(() => {
                this.app.fire(cr.Events.GAME_RESUME);
            });
    }.bind(this));
};

// home.js
var Home = pc.createScript('home');

// initialize code called once per entity
Home.prototype.initialize = function() {
    this.entity.element.on('click', function () {
        window.famobi_analytics.trackEvent("EVENT_LEVELFAIL", 
                                           {levelName: '' + cr.Storage.currentMission, reason: "quit"}).then(() => {
            this.app.fire(cr.Events.GAME_RESTART);
        });
    }.bind(this));
};

