import { createHash, randomBytes } from "crypto";

/*
Vc Id as per documentation a hex hashed value 
built up of the senderId # appId # dateTime in milliseconds # random string
*/
export function generateVcId(senderId: string, applicationId: string): string {
    if(!senderId || !applicationId || senderId === '' || applicationId === '')
      throw new Error("No senderId or applicationId set when generating vcId")
    return createHash('sha256')
      .update(`${senderId}#${applicationId}#${Date.now()}#${randomString()}`)
      .digest('hex');
}

function randomString(): string {
    return randomBytes(8).toString('hex');
}