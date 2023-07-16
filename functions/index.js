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
// const functions = require('firebase-functions');
const axios = require('axios');

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started


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