const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const sqlite3 = require('sqlite3').verbose();
const PREFIX = '!!';

let db = new sqlite3.Database('./user_data.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) console.error(err.message);
    console.log('Connected to the database.');

    db.run(`CREATE TABLE IF NOT EXISTS ranks (
        user_id TEXT PRIMARY KEY,
        daily_count INTEGER,
        total_count INTEGER
    )`, (err) => {
        if (err) console.error(err.message);
    });
});

client.on('ready', () => {
    console.log(`${client.user.tag}에 로그인하였습니다!`);
});

client.on('message', message => {
    if (message.author.bot) return;

    if (!message.content.startsWith(PREFIX)) {
        let sql = `INSERT INTO ranks (user_id, daily_count, total_count) VALUES(?,?,1)
                   ON CONFLICT(user_id) DO UPDATE SET daily_count = daily_count + 1, total_count = total_count + 1;`;

        db.run(sql, [message.author.id, 1], (err) => {
            if (err) return console.error(err.message);
        });
        return;
    }

    if (message.content.startsWith(PREFIX + 'rank')) {
        let sql = `SELECT daily_count, total_count FROM ranks WHERE user_id = ?`;

        db.get(sql, [message.author.id], (err, row) => {
            if (err) return console.error(err.message);
            if (row) {
                message.channel.send(`${message.author.username}님의 하루 메시지 수는 ${row.daily_count}개, 총 메시지 수는 ${row.total_count}개입니다.`);
            } else {
                message.channel.send('기록을 찾을 수 없습니다.');
            }
        });
    }
});

// 여기에 봇의 토큰을 입력하세요.
client.login('MTIxODQ5OTM3MTU2NjUwMTk5MQ.GqNZZG.CRDmtFTfW7OJSUkHQsjbTGPQF7d-8lkLpCJzJM');