const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(process.cwd(), 'ow-tracker.db');

// Delete if exists for clean seed
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new Database(dbPath, { verbose: console.log });

db.exec(`
  CREATE TABLE PLAYER (
    Player_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT NOT NULL,
    Discriminator INTEGER NOT NULL,
    Email_Address TEXT,
    Account_Creation_Date TEXT,
    Default_Region TEXT,
    Endorsement_Level INTEGER,
    Is_Banned BOOLEAN
  );

  CREATE TABLE GAME_MODE (
    Mode_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Mode_Name TEXT NOT NULL
  );

  CREATE TABLE MATCH (
    Game_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Mode_ID INTEGER,
    Map_Name TEXT,
    Server_Datacenter TEXT,
    Duration INTEGER,
    Timestamp TEXT,
    FOREIGN KEY(Mode_ID) REFERENCES GAME_MODE(Mode_ID)
  );

  CREATE TABLE ROLE (
    Role_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Role_Name TEXT NOT NULL
  );

  CREATE TABLE HERO (
    Hero_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Role_ID INTEGER,
    Hero_Name TEXT NOT NULL,
    Release_Date TEXT,
    Difficulty_Rating INTEGER,
    Base_Health INTEGER,
    FOREIGN KEY(Role_ID) REFERENCES ROLE(Role_ID)
  );

  CREATE TABLE SEASON (
    Season_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Season_Number INTEGER,
    Theme_Name TEXT,
    Base_Patch_Version TEXT,
    Start_Date TEXT,
    End_Date TEXT
  );

  CREATE TABLE PLAYER_MODE_STATS (
    Player_ID INTEGER,
    Mode_ID INTEGER,
    PRIMARY KEY (Player_ID, Mode_ID),
    FOREIGN KEY(Player_ID) REFERENCES PLAYER(Player_ID),
    FOREIGN KEY(Mode_ID) REFERENCES GAME_MODE(Mode_ID)
  );

  CREATE TABLE PLAYER_MATCH_STATS (
    Player_ID INTEGER,
    Game_ID INTEGER,
    Result TEXT,
    Damage_Dealt INTEGER,
    Healing_Done INTEGER,
    Eliminations INTEGER,
    Deaths INTEGER,
    Assists INTEGER,
    Objective_Time_Seconds INTEGER,
    Damage_Mitigated INTEGER,
    Ping_Average_MS INTEGER,
    PRIMARY KEY (Player_ID, Game_ID),
    FOREIGN KEY(Player_ID) REFERENCES PLAYER(Player_ID),
    FOREIGN KEY(Game_ID) REFERENCES MATCH(Game_ID)
  );

  CREATE TABLE MATCH_HERO_PERFORMANCE (
    Player_ID INTEGER,
    Game_ID INTEGER,
    Hero_ID INTEGER,
    Time_Played_On_Hero INTEGER,
    Damage_Done_On_Hero INTEGER,
    Ultimates_Earned INTEGER,
    Hero_Specific_Stat_Value INTEGER,
    PRIMARY KEY (Player_ID, Game_ID, Hero_ID),
    FOREIGN KEY(Player_ID) REFERENCES PLAYER(Player_ID),
    FOREIGN KEY(Game_ID) REFERENCES MATCH(Game_ID),
    FOREIGN KEY(Hero_ID) REFERENCES HERO(Hero_ID)
  );

  CREATE TABLE PLAYER_SEASON_RANK (
    Player_ID INTEGER,
    Season_ID INTEGER,
    Role_ID INTEGER,
    Skill_Tier TEXT,
    Division INTEGER,
    Peak_Tier TEXT,
    Peak_Division INTEGER,
    PRIMARY KEY (Player_ID, Season_ID, Role_ID),
    FOREIGN KEY(Player_ID) REFERENCES PLAYER(Player_ID),
    FOREIGN KEY(Season_ID) REFERENCES SEASON(Season_ID),
    FOREIGN KEY(Role_ID) REFERENCES ROLE(Role_ID)
  );
`);

console.log('Tables created.');

// Seed Data
// Roles
const insertRole = db.prepare('INSERT INTO ROLE (Role_Name) VALUES (?)');
const roles = ['Tank', 'Damage', 'Support'];
roles.forEach(r => insertRole.run(r));

// Heroes
const insertHero = db.prepare('INSERT INTO HERO (Role_ID, Hero_Name, Release_Date, Difficulty_Rating, Base_Health) VALUES (?, ?, ?, ?, ?)');
const heroes = [
  [1, 'Reinhardt', '2016-05-24', 1, 600],
  [1, 'D.Va', '2016-05-24', 2, 600],
  [2, 'Tracer', '2016-05-24', 2, 175],
  [2, 'Genji', '2016-05-24', 3, 200],
  [3, 'Mercy', '2016-05-24', 1, 200],
  [3, 'Ana', '2016-07-19', 3, 200]
];
heroes.forEach(h => insertHero.run(...h));

// Game Modes
const insertMode = db.prepare('INSERT INTO GAME_MODE (Mode_Name) VALUES (?)');
const modes = ['Quick Play', 'Competitive', 'Arcade'];
modes.forEach(m => insertMode.run(m));

// Season
db.prepare("INSERT INTO SEASON (Season_Number, Theme_Name, Base_Patch_Version, Start_Date, End_Date) VALUES (?, ?, ?, ?, ?)").run(20, 'Cyberpunk', '2.8', '2026-10-01', '2026-12-01');

// Player
const playerStmt = db.prepare("INSERT INTO PLAYER (Username, Discriminator, Email_Address, Account_Creation_Date, Default_Region, Endorsement_Level, Is_Banned) VALUES (?, ?, ?, ?, ?, ?, ?)");
playerStmt.run('farmerofaura01', 1337, 'farmer@example.com', '2023-01-01', 'NA', 4, 0);

// Player Season Rank
db.prepare("INSERT INTO PLAYER_SEASON_RANK (Player_ID, Season_ID, Role_ID, Skill_Tier, Division, Peak_Tier, Peak_Division) VALUES (?, ?, ?, ?, ?, ?, ?)").run(1, 1, 2, 'Grandmaster', 5, 'Grandmaster', 3);

// Generate matches
const insertMatch = db.prepare("INSERT INTO MATCH (Mode_ID, Map_Name, Server_Datacenter, Duration, Timestamp) VALUES (?, ?, ?, ?, ?)");
const insertPlayerStats = db.prepare("INSERT INTO PLAYER_MATCH_STATS (Player_ID, Game_ID, Result, Damage_Dealt, Healing_Done, Eliminations, Deaths, Assists, Objective_Time_Seconds, Damage_Mitigated, Ping_Average_MS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
const insertHeroPerf = db.prepare("INSERT INTO MATCH_HERO_PERFORMANCE (Player_ID, Game_ID, Hero_ID, Time_Played_On_Hero, Damage_Done_On_Hero, Ultimates_Earned, Hero_Specific_Stat_Value) VALUES (?, ?, ?, ?, ?, ?, ?)");

const maps = ["King's Row", "Route 66", "Ilios", "Oasis", "Lijiang Tower", "Dorado"];
const results = ["WIN", "LOSS", "DRAW", "WIN", "WIN"];

let matchIdCount = 1;
for (let i = 0; i < 20; i++) {
  const mapIndex = Math.floor(Math.random() * maps.length);
  const resultIndex = Math.floor(Math.random() * results.length);
  const duration = 600 + Math.floor(Math.random() * 600); // 10-20 min
  const date = new Date(Date.now() - i * 86400000).toISOString();
  
  insertMatch.run(2, maps[mapIndex], "USE", duration, date); // Competitive
  
  const kills = 15 + Math.floor(Math.random() * 30);
  const deaths = 3 + Math.floor(Math.random() * 10);
  const result = results[resultIndex];
  
  insertPlayerStats.run(1, matchIdCount, result, kills * 400, 0, kills, deaths, 5, 120, 0, 45);
  
  // They played Tracer or Genji
  const heroId = Math.random() > 0.5 ? 3 : 4; 
  insertHeroPerf.run(1, matchIdCount, heroId, duration, kills * 400, 4, 10);
  
  matchIdCount++;
}

console.log('Seed completed successfully!');
