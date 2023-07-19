/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const axios = require('axios');

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const app = initializeApp();
const db = getFirestore(app);



const bot_pattern = "...from_bot...";
// Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started

exports.onAIResponse = onDocumentUpdated("users/{user_id}/discussions/{dicussion_id}/messages/{message_id}", async (event) => {
    try {
        const message = event.data.after.data()
        if (message.status && message.status.state === "COMPLETED") {
            const number = event.params.dicussion_id;
            const replay = message.response + "/n" + bot_pattern;
            const full_name = message.full_name;
            const issueOrPull = message.issueOrPull;
            logger.log("number: ", number);
            logger.log("replay: ", replay);
            logger.log("full_name: ", full_name);
            logger.log("issueOrPull: ", issueOrPull);

            postComment(full_name, number, replay, issueOrPull).then(() => {
                // Send a success response once the comment is posted
                logger.log("Reply posted successfully");
            }).catch((error) => {
                logger.error("Error posting comment:", error);
            });
        }
    } catch (error) {
        logger.error("this error from onAIRepsonse " + error.message)
    }
})

exports.gitGithubToken = onRequest(async (request, response) => {
    const code = request.body.code;
    const res = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: 'ee653353d29746053fa5',
        client_secret: '1290cbc61beb9501fd6643099c3a1b051a842995',
        code: code,
        redirect_uri: 'exp://192.168.100.30:19000',
    }, {
        headers: {
            "content-type": "application/json"
        }
    });

    const accessTokenParams = res.data.split("&")[0];
    const accessToken = accessTokenParams.split("=")[1];
    response.send(accessToken);
});

exports.hello = onRequest((request, response) => {
    response.send("hello")
})

exports.gitGithubProfile = onRequest(async (request, response) => {
    try {
        const access_token = request.body.access_token;
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        response.send(userResponse.data);
    } catch (error) {
        logger.log(error.message)
        response.status(501).send(error.message)
    }
});


exports.gitGithubStarredRepos = onRequest(async (request, response) => {

    const access_token = request.body.access_token;
    const userResponse = await axios.get('https://api.github.com/user/starred', {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
    response.send(userResponse.data);

});


exports.GitHubWebHook = onRequest(async (request, response) => {
    try {
        const payload = request.body;

        // Check if the payload is for an issue, pull request, or comment
        if (payload.action === "opened" || payload.action === "created") {
            const comment = payload.comment || payload.issue;

            //logger.log("payload: ", payload);
            const test = comment.body;
            let issueOrPull = "issues";
            logger.log("issueOrPull: ", issueOrPull);

            // Generate a reply message using PaLM
            if (!test.includes(bot_pattern)) {
                let user_id = "1";
                let number = "1";
                if (payload.issue) {
                    user_id = payload.issue.user.id;
                    number = payload.issue.number;
                } else if (payload.pull_request) {
                    user_id = payload.pull_request.id;
                    number = payload.pull_request.number;
                    issueOrPull = "pull_request";
                } else {
                    return;
                }

                // logger.log("user_id: ", user_id);
                // logger.log("number: ", number);

                const ref = db.collection(`users/${user_id}/discussions/${number}/messages`).doc();
                await ref.set({
                    prompt: comment.body,
                    full_name: payload.repository.full_name,
                    issueOrPull: issueOrPull
                })

                response.send("ok")
            } else {
                // Ignore other actions
                response.status(200).send("Action ignored");
            }
        } else {
            // Ignore other actions
            response.status(200).send("Action ignored");
        }
    } catch (error) {
        logger.error("Error on GitHub webhook:", error);
        response.status(500).send("Error processing webhook");
    }
});


async function postComment(full_name, comment, reply, issueOrPull) {
    try {
        // logger.log("fullname: ", full_name);
        // logger.log("comment: ", comment);
        // logger.log("reply: ", reply);
        const access_token = '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';
        if (issueOrPull === "issues") {
            const response = await axios.post('https://api.github.com/repos/' + full_name + '/issues/' + comment + '/comments', {
                body: reply,
            },
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                });            
        } else if (issueOrPull === "pull_request") {
            const response = await axios.post('https://api.github.com/repos/' + full_name + '/pulls/' + comment + '/comments', {
                body: reply,
            },
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                });            
        }
        // response.send(postComment);
        // If you want to log the response data
    } catch (error) {
        console.error(error);
    }
};
//three
//two