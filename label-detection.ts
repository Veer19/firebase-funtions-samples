import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'
// Imports the Google Cloud client library

import * as vision from '@google-cloud/vision';
// Creates a client
const client = new vision.ImageAnnotatorClient();

// Performs label detection on the image file

var config = {
    apiKey: "AIzaSyDf7pIvqRGhPwEdEMa2gEaHvB5YwnuGMXc",
    authDomain: "captit-3c24c.firebaseapp.com",
    databaseURL: "https://captit-3c24c.firebaseio.com",
    projectId: "captit-3c24c",
    storageBucket: "captit-3c24c.appspot.com",
    messagingSenderId: "387939430325"
  };
admin.initializeApp(config);

export const labelDetection = functions.storage.object().onFinalize(object=>{
    
    const filePath = object.name;

    const fileName = filePath.split("/").pop();
    const bucket = admin.storage().bucket();
    const tempFilePath = '/tmp/'+ fileName;

    if(!object.contentType.startsWith("image/")){
        console.log("Not an image");
        return null;
    } 
    return bucket.file(filePath).download({
        destination: tempFilePath
    })
    .then(()=>{
        return client.labelDetection(tempFilePath)
    })
    .then((results)=>{
        
        const labels = results[0].labelAnnotations;

        console.log('Labels:');
        labels.forEach(label => console.log(label.description));
    })
    .catch(err => {
        console.error('ERROR:', err);
    });
})
