const readline = require('readline');
const { processUrl } = require('./controllers/processUrls');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter commands (e.g., "--metadata https://www.example.com" or "https://www.example.com"): ', async (input) => {
    const commands = input.split(' ');
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        if (command === '--metadata' && i < commands.length - 1) {
            await processUrl(commands[++i], true);
        } else if (command.startsWith('http')) {
            await processUrl(command, false);
        }
    }
    rl.close();
});