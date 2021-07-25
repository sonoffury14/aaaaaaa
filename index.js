//configuration
const Discord = require("discord.js")
const DisTube = require("distube");
const client = new Discord.Client({disableMention: "everyone"});
const config = {
    prefix: "!",
    token: "ODY4ODc1MTU2OTg1MTE0Njg0.YP2BDA.I4b1fbWIdBMfmHOtu8M3P1VOBac"
}
const distube = new DisTube(client, { searchSongs: true, emitNewSongOnly: true, highWaterMark: 1<<25})
const filters = ["3d", "bassboost", "echo", "karaoke", "nightcore", "vaporwave", "flanger"];


//events
client.login(config.token);

client.on("ready", () =>{
    console.log(`A bot elindult mint: ${client.user.tag}`);
    client.user.setActivity("Son of Fury teszt", {type: "LISTENING"});
})

client.on("message", message => {
    if(message.author.bot){ return; }
    if(!message.guild) return;
    
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift();

    if(command === "ping"){
        return embedbuilder(client, message, `YELLOW`, `A bot pingje:`, `\`${client.ws.ping} ms\``)
    }

    if(command === "play" || command === "p"){
        embedbuilder(client, message, "GREEN", "Keresés!", `A bot keresi a zenét amit választottál!`)
        return distube.play(message, args.join(" "));
    }

    if(command === "skip" || command === "s"){
        embedbuilder(client, message, "YELLOW", "Átugorva!", `A bot mostmár a következő zenét játsza le!`)
        return distube.skip(message);
    }

    if(command === "stop" || command === "leave"){
        embedbuilder(client, message, "RED", "Megállítva", `A bot kilépett a hangcsatornából!`)
        return distube.stop(message);
    }

    if(filters.includes(command)) {
        let filter = distube.setFilter(message, command);
        return embedbuilder(client, message, "BLUE", "Filter hozzáadás!", filter)
    }

    if(command === "volume" || command === "vol"){
        embedbuilder(client, message, "BLACK", "Hangerő", `Hangerő beállítva \`${args[0]} %-ra!\``)
        return distube.setVolume(message, args[0]);
    }

    if(command === "queue" || command === "qu"){
        let queue = distube.getQueue(message);

        return embedbuilder(client, message, "GREEN", "Jelenlegi sor!", queue.songs.map((song, id)=>{
            `**${id + 1}.** [\`${song.name}\`](${song.url})  -  **\`${song.formattedDuration}\`**`
        }).join("\n"))
    }

    if(command === "loop" || command === "repeat"){
        if(0 <= Number(args[0]) && Number(args[0]) <= 2){
            distube.setRepeatMode(message, parseInt(args[0]))
            embedbuilder(client, message, "YELLOW", "Ismétlés", `Ismétlés beállítva erre: \`${args[0].replace("0", "Kikapcsolva").replace("1", "Jelenlegi zene ismétlése").replace("2", "Jelenlegi sor ismétlése")}\``)
        }
        else{
            embedbuilder(client, message, "RED", "HIBA", `Kérlek adj meg egy számot **0** és **2** között!\n0 = Kikapcsolva  |  1 = Jelenlegi zene ismétlése  |  2 = Összes zene ismétlése a jelenlegi sorban!`)
        }
    }

})
//queue
const status = (queue) => `Hangerő: \`${queue.volume}\`\nFilter: \`${queue.filter | "Kikapcsolva"}\`\nIsmétlés: \`${queue.repeatMode ? queue.repeatMode === 2 ? "Összes sorban álló zene" : "Ez a zene" : "Kikapcsolva"}\`\nAutomatikus lejátszás: \`${queue.autoplay ? "Bekapcsolva" : "Kikapcsolva"}\``

//distube
distube
    .on("playSong", (message, queue, song) => {
        embedbuilder(client, message, "GREEN", "Új zene indult!", `Zene: \`${song.name}\`  -  \`${song.formattedDuration}\` \n\nA zenét kérte: ${song.user}\n${status(queue)}`)
    })
    .on("addSong", (message, queue, song) => {
        embedbuilder(client, message, "GREEN", "Új zene hozzáadva!", `Zene: \`${song.name}\`  -  \`${song.formattedDuration}\` \n\nA zenét kérte: ${song.user}`)
    })
    .on("playList", (message, queue, playList, song) => {
        embedbuilder(client, message, "GREEN", "A lejátszási lista lejátszásra került!", `Lejátszási lista: \`${playlist.title}\`  -  \`${playlist.total_items} zenék\` \n\nA zenét kérte: ${song.user}\n\n A zene lejátszása elkezdődött: \`${song.name}\`  -  \`${song.formattedDuration}\`\n${status(queue)}`)
    })
    .on("addList", (message, queue, song) => {
        embedbuilder(client, message, "GREEN", "Új lejátszási lista hozzáadva!", `Lejátszási lista: \`${playlist.title}\`  -  \`${playlist.total_items} zenék\` \n\nA zenét kérte: ${song.user}`)
    })
    .on("searchResult", (message, result) => {
        let i = 0;
        embedbuilder(client, message, "GREEN", "", `**Válasz egy lehetőséget alul!**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n**Írj be valami mást vagy várj 60 másodpercet!**`)
    })
    .on("searchCancel", (message) => embedbuilder(client, message, "GREEN", `Keresés abbahagyva!`, "")
    )
    .on("error", (message, err) => embedbuilder(client, message, "GREEN", "Egy hiba van a rendszerben: " + err)
    )


//function embeds

function embedbuilder(client, message, color, title, description){

    let embed= new Discord.MessageEmbed()
    .setColor(color)
    .setFooter(client.user.username, client.user.displayAvatarURL());
    if(title) embed.setTitle(title);
    if(description) embed.setDescription(description);
    return message.channel.send(embed);
}