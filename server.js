const express = require('express')
const cheerio = require('cheerio')
const axios = require('axios')
const rwClient = require('./twitter_client');


const app = express()
const url = 'https://localelection.ekantipur.com/pradesh-3/district-kathmandu/kathmandu?lng=eng';
var balen = '';
const PORT = 8000;

var ii = 0
var minutes = 5, the_interval = minutes * 60 * 1000;
setInterval(async function () {
    axios(url)
        .then(
            async response => {
                console.log("I am doing my 5 minutes check " + ii++);
                var html = await response.data;
                var $ = cheerio.load(html);
                var data = [];

                $('.candidate-meta-wrapper', html).each(async function () {
                    var candidate_name = $(this).find('.candidate-meta').find('.candidate-name').text()
                    var candidate_party = $(this).find('.candidate-meta').find('.candidate-party-name').text()
                    var votes = $(this).find('.vote-numbers').text()
                    data.push({
                        candidate_name,
                        candidate_party,
                        votes,
                    })
                })

                var mayor = [
                    'Balendra Shah',
                    'Keshav Sthapit',
                    'Shirjana Shrestha',
                    'Madan Das Shrestha',
                ]

                var deputy = [
                    'Sunita Dangol',
                    'Rameshwore Shrestha',
                    'Binita Magaiya',
                    'Kriti Kansakar',
                ]
                var setup = data.filter(obj => {
                    return obj.candidate_name === mayor[0]
                })

                var result = data.filter(obj => {
                    return obj.candidate_name === mayor[0] || obj.candidate_name === mayor[1] || obj.candidate_name === mayor[2] || obj.candidate_name === mayor[3]
                })
                // console.log(result);
                var deputy_result = data.filter(obj => {
                    return obj.candidate_name === deputy[0] || obj.candidate_name === deputy[1] || obj.candidate_name === deputy[2] || obj.candidate_name === deputy[3]
                })
                console.log(balen,result[0].votes);
                if (balen != setup[0].votes) {
                    balen = setup[0].votes
                    var tweetText = ''
                    var mayorTweetText = ''
                    var deputyTweetText = ''
                    for (i = 0; i <= 3; i++) {
                        mayorTweetText += result[i].candidate_name + ':' + result[i].votes + '\n'
                    }
                    for (i = 0; i <= 3; i++) {
                        deputyTweetText += deputy_result[i].candidate_name + ':' + deputy_result[i].votes + '\n'
                    }
                    tweetText = 'KTM Metro:\nMayor:\n' + mayorTweetText + '\nDeputy:\n' + deputyTweetText + '\nBot Generated!\nSource:ekantipur\n#LocalElections2022\n#LocalElections2079'
                    var tweet = async () => {
                        try {
                            await rwClient.v1.tweet(tweetText)
                        } catch (err) {
                            console.log(err);
                        }
                    }
                    console.log(tweetText);
                    tweet()
                }



            }
        )
        .catch(err => {
            console.log(err);
        })

}, the_interval);



app.listen(PORT, () => {

})