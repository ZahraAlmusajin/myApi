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
import axios from 'axios';
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

// exports.GitHubWebHook = onRequest(async (request, response) => {
//     try {
//         const payload = request.body;
        
//         // Check if the payload is for an issue, pull request, or comment
//         if (payload.action === "opened" || payload.action === "created") {
//             const comment = payload.comment || payload.issue;
            
//             // Get the username who made the comment
//             const username = comment.user.login;
            
//             // Generate a reply message using PaLM
//             const reply = generateReply(comment.body);
            
//             // Post the reply as a comment back to GitHub
//             await postComment(payload.repository.full_name, comment.id, reply);
            
//             // Send a success response
//             response.status(200).send("Reply posted successfully");
//         } else {
//             // Ignore other actions
//             response.status(200).send("Action ignored");
//         }
//     } catch (error) {
//         logger.error("error on github webhook", error.message);
//         response.status(500).send(error.message);
//     }
// });

// exports.GitHubWebHook = onRequest(async (request, response) => {
//     try {
//         const access_token = request.body.access_token;
//         const payload = request.body;

//         // Check if the payload is for an issue, pull request, or comment
//         if (payload.action === "opened" || payload.action === "created") {
//             const comment = payload.comment || payload.issue;

//             // Get the username who made the comment
//             const username = comment.user.login;

//             // Generate a reply message using PaLM
//             const reply = generateReply(comment.body);

//             // Start a background task to post the reply as a comment back to GitHub
//             postComment(username,payload.repository.full_name, comment.id, reply)
//                 .then(() => {
//                     // Send a success response once the comment is posted
//                     response.status(200).send("Reply posted successfully");
//                 })
//                 .catch((error) => {
//                     logger.error("Error posting comment:", error);
//                     response.status(500).send("Error posting comment");
//                 });
//         } else {
//             // Ignore other actions
//             response.status(200).send("Action ignored");
//         }

//         const postComment = async (username,full_name,comment, reply ) => {
//             try {
//               const response = await axios.post('https://api.github.com/repos/'+username+'/'+full_name+'/'+comment, {
//                 body: comment,
//               }, 
//               {
//                 headers: {
//                   Authorization: 'Bearer'+ access_token,
//                 },
//               });
          
//               console.log(response.data); // If you want to log the response data
//             } catch (error) {
//               console.error(error);
//             }
//           };
          

        // const payload = request.body;///

        // let webhook_info = {
        // repo : payload.repository.name,
        // author : payload.sender.login,
        // time : payload.head_commit.timestamp
        // }

        // const save_webhook = await request.db
        // .collection("webhooks")
        // .insertOne(webhook_info);

        // res.status(201).send({
        // message: "Webhook Event successfully logged"
        // });///
    // } catch (error) {
    //     logger.error("Error on GitHub webhook:", error);
    //     response.status(500).send("Error processing webhook");
    // }
// });

// async function postComment(name, id, reply){

// }

// exports.getGitHubwebhook = functions.https.onRequest(async (request, response) => {
//     try {
//         const event = request.headers['x-github-event'];
//         const payload = request.body;

//         if (event === 'issues') {
//             // Handle issues event
//             if (payload.action === 'opened') {
//                 // Handle issues opened event
//                 const issueNumber = payload.issue.number;
//                 const issueTitle = payload.issue.title;
//                 const issueBody = payload.issue.body;

//                 // Generate a reply message
//                 const replyMessage = `Thanks for opening issue #${issueNumber} - ${issueTitle}. We will investigate the issue and get back to you as soon as possible.`;

//                 // Post the reply message to GitHub
//                 await postCommentToIssue(payload.repository.owner.login, payload.repository.name, issueNumber, replyMessage);

//                 // Send a response to acknowledge receipt of the webhook event
//                 response.status(200).send('Webhook received');
//             } else {
//                 // Send a response to ignore webhook events that are not relevant
//                 response.status(200).send('Webhook ignored');
//             }
//         } else if (event === 'issue_comment') {
//             // Handle issue comment event
//             if (payload.action === 'created') {
//                 // Handle issue comment created event
//                 const issueNumber = payload.issue.number;
//                 const commentBody = payload.comment.body;

//                 // Generate a reply message
//                 const replyMessage = `Thanks for your comment on issue #${issueNumber}: ${commentBody}. We will look into this and get back to you.`;

//                 // Post the reply message to GitHub
//                 await postCommentToIssue(payload.repository.owner.login, payload.repository.name, issueNumber, replyMessage);

//                 // Send a response to acknowledge receipt of the webhook event
//                 response.status(200).send('Webhook received');
//             } else {
//                 // Send a response to ignore webhook events that are not relevant
//                 response.status(200).send('Webhook ignored');
//             }
//         } else if (event === 'pull_request_review') {
//             // Handle pull request review event
//             if (payload.action === 'submitted') {
//                 // Handle pull request review submitted event
//                 const pullRequestNumber = payload.pull_request.number;
//                 const reviewBody = payload.review.body;

//                 // Generate a reply message
//                 const replyMessage = `Thanks for your review on pull request #${pullRequestNumber}: ${reviewBody}. We will address your feedback and make any necessary changes.`;

//                 // Post the reply message to GitHub
//                 await postCommentToPullRequest(payload.repository.owner.login, payload.repository.name, pullRequestNumber, replyMessage);

//                 // Send a response to acknowledge receipt of the webhook event
//                 response.status(200).send('Webhook received');
//             } else if (payload.action === 'edited') {
//                 // Handle pull request review edited event
//                 // Do something
//             } else {
//                 // Send a response to ignore webhook events that are not relevant
//                 response.status(200).send('Webhook ignored');
//             }
//         } else if (event === 'pull_request') {
//             // Handle pull request event
//             if (payload.action === 'opened') {
//                 // Handle pull request opened event
//                 const pullRequestNumber = payload.pull_request.number;
//                 const pullRequestTitle = payload.pull_request.title;

//                 // Generate a reply message
//                 const replyMessage = `Thanks for opening pull request #${pullRequestNumber} - ${pullRequestTitle}. We will review your changes and get back to you.`;

//                 // Post the reply message to GitHub
//                 await postCommentToPullRequest(payload.repository.owner.login, payload.repository.name, pullRequestNumber, replyMessage);

//                 // Send a response to acknowledge receipt of the webhook event
//                 response.status(200).send('Webhook received');
//             } else {
//                 // Send a response to ignore webhook events that are not relevant
//                 response.status(200).send('Webhook ignored');
//             }
//         } else if (event === 'pull_request_review_comment') {
//             // Handle pull request review comment event
//             if (payload.action === 'created') {
//                 // Handle pull request review comment created event
//                 const pullRequestNumber = payload.pull_request.number;
//                 const commentBody = payload.comment.body;

//                 // Generate a reply message
//                 const replyMessage = `Thanks for your comment on pull request #${pullRequestNumber}: ${commentBody}. We will look into this and make any necessary changes.`;

//                 // Post the reply message to GitHub
//                 await postCommentToPullRequest(payload.repository.owner.login, payload.repository.name, pullRequestNumber, replyMessage);

//                 // Send a response to acknowledge receipt of the webhook event
//                 response.status(200).send('Webhook received');
//             } else {
//                 // Send a response to ignore webhook events that are not relevant
//                 response.status(200).send('Webhook ignored');
//             }
//         } else {
//             // Send a response to ignore webhook events that are not relevant
//             response.status(200).send('Webhook ignored');
//         }
//     } catch (error) {
//         console.error(error);
//         response.status(500).send(error.message);
//     }
// });

const { spawnSync } = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

exports.GitHubWebHook = onRequest(async (request, response) => {
  try {
    const payload = request.body;
    const issueOrComment = payload.issue || payload.comment;

    // Check if the payload is for an issue, pull request, or comment
    if (issueOrComment) {
      const body = issueOrComment.body;
      const reply = await generateReply(body);

      // Post the reply as a comment back to GitHub
      await postComment(issueOrComment.html_url, reply);

      // Send a success response
      response.status(200).send("Reply posted successfully");
    } else {
      // Ignore other actions
      response.status(200).send("Action ignored");
    }
  } catch (error) {
    logger.error("error on github webhook", error.message);
    response.status(500).send(error.message);
  }
});

async function generateReply(commentBody) {
  // Run PaLM as a child process
  const result = spawnSync('palm', ['reply', '-m', 'my-model'], { input: commentBody });

  if (result.status !== 0) {
    throw new Error(`PaLM exited with status code ${result.status}`);
  }

  return result.stdout.toString().trim();
}

async function postComment(url, comment) {
  const authToken = process.env.GITHUB_ACCESS_TOKEN;
  const repoUrl = url.substring(0, url.indexOf('/issues/'));
  const issueNumber = url.substring(url.lastIndexOf('/') + 1);
  const apiUrl = `${repoUrl}/issues/${issueNumber}/comments`;

  const { stdout, stderr } = await exec(`curl -H "Authorization: token ${authToken}" -d '{"body": "${comment}"}' -X POST ${apiUrl}`);

  if (stderr) {
    throw new Error(stderr);
  }

  return JSON.parse(stdout);
}