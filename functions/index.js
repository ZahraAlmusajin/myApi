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


exports.GitHubWebHook = onRequest(async (request, response) => {
    try {
        const payload = request.body;
        //const event = request.headers['x-github-event'];

        // Check if the payload is for an issue, pull request, or comment
        if (payload.action === "opened" || payload.action === "created") {
            const comment = payload.comment || payload.issue || payload.pull_request;

            // Get the username who made the comment
            const username = comment.user.login;

            // Generate a reply message using PaLM
            const reply = await generateReply(payload.body);

            // Start a background task to post the reply as a comment back to GitHub
            postComment(event ,payload, payload.repository.full_name, reply)
                .then(() => {
                    // Send a success response once the comment is posted
                    response.status(200).send("Reply posted successfully");
                })
                .catch((error) => {
                    logger.error("Error posting comment:", error);
                    response.status(500).send("Error posting comment");
                });
        } else {
            // Ignore other actions
            response.status(200).send("Action ignored");
        }
    } catch (error) {
        logger.error("Error on GitHub webhook:", error);
        response.status(500).send("Error processing webhook");
    }
});

exports.getReply = onRequest(async (req, res) => {
    const rply = await generateReply("hi");
    res.send(rply);
})

async function postComment(payload, repoName, reply) {
    try {
        const isuueNum = payload.issue.number;
        logger.log("fullname: ", repoName);
        logger.log("comment: ", isuueNum);
        logger.log("reply: ", reply);
        const access_token = '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';
        //if (payload.issue){
            const response = await axios.post('https://api.github.com/repos/' + repoName + '/issues/' + isuueNum + '/comments', {
                body: reply,
            },
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                });
            response.send(postComment)
        //}
        // console.log(response.data); // If you want to log the response data
    } catch (error) {
        console.error(error);
    }
};

async function generateReply(inputMessage) {
    try {
        // const response = await axios.post('users/{uid}/discussions/{discussionId}/messages', {
        //     input: inputMessage
        // });


        // // Extract the generated reply from the response
        // const generatedReply = response.data.reply;

        // response.send(generatedReply);
        return new Promise((resolve, reject) => {
            resolve("hello world");
        });

    } catch (error) {
        console.error("Error generating reply:", error);
        // Return a default error message or handle the error appropriately
        response.send("Error generating reply. Please try again later.");
    }
};
// comment