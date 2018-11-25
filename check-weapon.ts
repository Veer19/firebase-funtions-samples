import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'
// Imports the Google Cloud client library

import * as vision from '@google-cloud/vision';
// Creates a client
const client = new vision.ImageAnnotatorClient();

// Performs label detection on the image file

var config = {
    ---------------
  };
admin.initializeApp(config);

export const checkIfWeapon = functions.storage.object().onFinalize(object=>{
    
    const filePath = object.name;

    if(!object.contentType.startsWith("image/")){
        console.log("Not an image");
        return null;
    }     
    return client.labelDetection('gs://'+object.bucket+'/'+filePath)
    .then((results)=>{
        
        const labels = results[0].labelAnnotations;
        labels.forEach(label => {
            console.log("Labels "+label.description);
            if(label.description=="weapon"){
                console.log("pushing weaponID")
                admin.database().ref("weapons/").push(filePath).then(()=>console.log("pushed"))
            }
        });
    })
    .catch(err => {
        console.error('ERROR:', err);
    });
})
