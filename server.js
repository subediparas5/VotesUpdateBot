const express = require('express')
const cheerio = require('cheerio')
const axios = require('axios')
const rwClient = require('./twitter_client');


const app = express()
const url = 'https://localelection.ekantipur.com/pradesh-3/district-kathmandu/kathmandu?lng=eng';
const PORT = 8000;

let ii = 0
var minutes = .1, the_interval = minutes * 60 * 1000;
let highest_mayor_votes = ''
setInterval(async function () {
    axios(url)
        .then(
            async response => {
                console.log(`I am doing my ${minutes} minutes check ` + ii++);
                var html = await response.data;
                var mayor_substring = await html.substring(
                    html.indexOf("Mayor"), html.lastIndexOf("Deputy Mayor")
                )
                var $ = cheerio.load(mayor_substring);
                var mayor_data = [];
                let total_mayor_votes = 0


                $('.candidate-meta-wrapper', mayor_substring).each(async function () {
                    var candidate_name = $(this).find('.candidate-meta').find('.candidate-name').text()
                    var candidate_party = $(this).find('.candidate-meta').find('.candidate-party-name').text()
                    var votes = $(this).find('.vote-numbers').text()
                    total_mayor_votes += Number(votes)
                    mayor_data.push({
                        candidate_name,
                        candidate_party,
                        votes,
                    })
                })
                //console.log(total_mayor_votes);

                // var deputy_substring = html.substring(
                //     html.indexOf("Deputy Mayor"), html.lastIndexOf("Balendra Shah")
                // )
                // var $ = cheerio.load(deputy_substring);
                // var deputy_data = [];
                // let total_deputy_votes = 0

                // $('.candidate-meta-wrapper', deputy_substring).each(async function () {
                //     var candidate_name = $(this).find('.candidate-meta').find('.candidate-name').text()
                //     var candidate_party = $(this).find('.candidate-meta').find('.candidate-party-name').text()
                //     var votes = $(this).find('.vote-numbers').text()
                //     total_deputy_votes += Number(votes)
                //     deputy_data.push({
                //         candidate_name,
                //         candidate_party,
                //         votes,
                //     })
                // })
                mayor_data.sort(function (b, a) {
                    return a.votes - b.votes
                })

                function numberWithCommas(x) {
                    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
                // deputy_data.sort(function (b, a) {
                //     return a.votes - b.votes
                // })
                //highest votes data to check for data change
                if (highest_mayor_votes != mayor_data[0].votes) {
                    highest_mayor_votes = mayor_data[0].votes

                    //top 3 mayor data
                    let mayor_text = ''
                    let mayor_loop_total = 0
                    for (i = 0; i < 3; i++) {
                        mayor_text += `${mayor_data[i].candidate_name}: ${numberWithCommas(Number(mayor_data[i].votes))} (${(Number(mayor_data[i].votes / total_mayor_votes) * 100).toFixed(2)}%)\n`
                        mayor_loop_total += Number(mayor_data[i].votes)
                    }
                    mayor_text += `Others: ${numberWithCommas(total_mayor_votes - mayor_loop_total)}: (${(Number(total_mayor_votes - mayor_loop_total) / Number(total_mayor_votes) * 100).toFixed(2)}%)`


                    // let deputy_text = ''
                    // let deputy_loop_total = 0
                    // //top 2 deputy mayor data
                    // for (i = 0; i < 2; i++) {
                    //     deputy_text += `${deputy_data[i].candidate_name}:${Number(deputy_data[i].votes)}(${(Number(deputy_data[i].votes / total_deputy_votes) * 100).toFixed(2)}%)\n`
                    //     deputy_loop_total += Number(deputy_data[i].votes)
                    // }
                    // deputy_text += `Others:${total_deputy_votes - deputy_loop_total}:(${(Number(total_deputy_votes - deputy_loop_total) / Number(total_deputy_votes) * 100).toFixed(2)}%)`
                    let tweetText = `KTM Metro Mayor:\n${'-'.repeat([30])}\n${mayor_text}\n${'-'.repeat([30])}\nTotal Votes Counted:${numberWithCommas(total_mayor_votes)}\n\nBot Generated!\n#LocalElections2022\n#LocalElections2079`
                    console.log(tweetText);
                    let tweet = async () => {
                        try {
                            await rwClient.v1.tweet(tweetText)
                        } catch (err) {
                            console.log(err);
                        }
                    }
                    // tweet()
                }
            }
        )
        .catch(err => {
            console.log(err);
        })

}, the_interval);



app.listen(PORT, () => {

})