const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(process.cwd(), 'ow-tracker.db');
const db = new Database(dbPath);

const insertHero = db.prepare('INSERT INTO HERO (Role_ID, Hero_Name, Release_Date, Difficulty_Rating, Base_Health) VALUES (?, ?, ?, ?, ?)');

const heroes = [
  // Tanks (Role 1)
  [1, 'Doomfist', '2017-07-27', 3, 450],
  [1, 'Junker Queen', '2022-10-04', 2, 425],
  [1, 'Mauga', '2023-12-05', 1, 500],
  [1, 'Orisa', '2017-03-21', 2, 275],
  [1, 'Ramattra', '2022-12-06', 2, 450],
  [1, 'Roadhog', '2016-05-24', 1, 700],
  [1, 'Sigma', '2019-08-13', 3, 350],
  [1, 'Winston', '2016-05-24', 2, 350],
  [1, 'Wrecking Ball', '2018-07-24', 3, 600],
  [1, 'Zarya', '2016-05-24', 3, 400],
  [1, 'Hazard', '2024-12-10', 2, 450],

  // Damage (Role 2)
  [2, 'Ashe', '2018-11-13', 2, 200],
  [2, 'Bastion', '2016-05-24', 1, 300],
  [2, 'Cassidy', '2016-05-24', 2, 225],
  [2, 'Echo', '2020-04-14', 3, 200],
  [2, 'Hanzo', '2016-05-24', 3, 200],
  [2, 'Junkrat', '2016-05-24', 2, 200],
  [2, 'Mei', '2016-05-24', 3, 250],
  [2, 'Pharah', '2016-05-24', 1, 200],
  [2, 'Reaper', '2016-05-24', 1, 250],
  [2, 'Sojourn', '2022-10-04', 2, 200],
  [2, 'Soldier: 76', '2016-05-24', 1, 200],
  [2, 'Sombra', '2016-11-15', 3, 200],
  [2, 'Symmetra', '2016-05-24', 2, 225],
  [2, 'Torbjorn', '2016-05-24', 2, 200],
  [2, 'Widowmaker', '2016-05-24', 2, 175],
  [2, 'Venture', '2024-04-16', 2, 200],

  // Support (Role 3)
  [3, 'Baptiste', '2019-03-19', 3, 200],
  [3, 'Brigitte', '2018-03-20', 1, 150],
  [3, 'Illari', '2023-08-10', 2, 200],
  [3, 'Juno', '2024-08-20', 2, 200],
  [3, 'Kiriko', '2022-10-04', 3, 200],
  [3, 'Lifeweaver', '2023-04-11', 3, 225],
  [3, 'Lucio', '2016-05-24', 2, 200],
  [3, 'Moira', '2017-11-16', 1, 200],
  [3, 'Zenyatta', '2016-05-24', 3, 200]
];

db.transaction(() => {
  for (const hero of heroes) {
    const existing = db.prepare('SELECT Hero_ID FROM HERO WHERE Hero_Name = ?').get(hero[1]);
    if (!existing) {
      insertHero.run(...hero);
    }
  }
})();
console.log("All Overwatch heroes added successfully.");
