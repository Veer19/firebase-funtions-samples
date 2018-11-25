import * as functions from 'firebase-functions';
//import { Bucket } from '@google-cloud/storage';
//const bucket: Bucket = {} as any;
//const gcs = require('@google-cloud/storage')();
//const spawn = require('child-process-promise').spawn
import { spawn } from 'child-process-promise';
import * as admin from 'firebase-admin'

var config = {
   ---------------
  };
admin.initializeApp(config);

export const generateThumbnail = functions.storage.object().onFinalize(object=>{

    const filePath = object.name;
    const fileName = filePath.split("/").pop();
    const bucket = admin.storage().bucket();
    const tempFilePath = '/tmp/'+ fileName;

    if(fileName.startsWith('thumb_')) {
        console.log("Already a thumbnail")
        return null;
    }

    if(!object.contentType.startsWith("image/")){
        console.log("Not an image");
        return null;
    }    
    return bucket.file(filePath).download({
        destination: tempFilePath
    })
    .then(()=>{
        console.log("Converting....");
        return spawn("convert", [tempFilePath, "-thumbnail","200x200>",tempFilePath])
    })
    .then(()=>{
        console.log("Thumb created");
        const thumbFilePath = filePath.replace(/(\/)?([^\/]*)$/, '$1thumb_$2');

        return bucket.upload(tempFilePath, {
            destination: thumbFilePath
        })
    })
})
