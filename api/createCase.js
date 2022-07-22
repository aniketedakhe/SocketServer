const { response } = require('express');
const { dbConfig } = require('../configuration/config');

module.exports = async function (req, res, dataObject) {
    var caseRecord = require('../configuration/tcaSchema');
    // for (let key in caseRecord) {
    //     caseRecord[key] = '';
    // }

    setEmpty(caseRecord);

    caseRecord.caseId = getCaseId();

    if (req) {
        
        for (let key in req.body) {
            caseRecord[key] = req.body[key];
        }
        
        res.setHeader('Content-Type', 'application/json');

        try {
            const client = await require('../api/dbConnect')(dbConfig.url);
            const db = await client.db(dbConfig.dbName);
            const caseHeader = await db.collection(dbConfig.dbCollectionName).insertOne(caseRecord);
            const responseMessage = caseRecord;
            res.statusCode = 200;
            res.write(JSON.stringify(responseMessage));
        }
        catch (e) {
            res.statusCode = 500;
            res.write((e.errmsg) ? JSON.stringify(e.errmsg) : JSON.stringify(e));
        }

        delete caseRecord._id;
        return res;
    }


    if (dataObject) {
        caseRecord.customerDetails = dataObject.userDetails;
        caseRecord.prearrivalInformation.importItems = dataObject.requestedProducts;
        try {
            const client = await require('../api/dbConnect')(dbConfig.url);
            const db = await client.db(dbConfig.dbName);
            const caseHeader = await db.collection(dbConfig.dbCollectionName).insertOne(caseRecord);
            delete caseRecord._id;
            return Promise.resolve(caseRecord); 
        }
        catch (e) {
            Promise.reject(e);
        }
    }
}

function getCaseId() {
    d = new Date();
    return (String(d.getDate()) + String(d.getMonth() + 1) + String(d.getFullYear()) + String(d.getHours()) + String(d.getMinutes()) + String(d.getSeconds()) + String(d.getMilliseconds()));
}

function setEmpty(input){

    let keys = Object.keys(input);

        for( let key of keys ){

             if(typeof input[key] != "object" ){
                 input[key] = null;
             }else{
                 setEmpty(input[key]);
             }
        }
        return input;
    }