const { response } = require('express');
const { dbConfig } = require('../configuration/config');

module.exports = async function (req, res, dataObject) {
    var caseRecord = require('../configuration/tcaSchema');
    setCaseMetaData(caseRecord, req.body, dataObject)

    if (req) {

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

function setEmpty(input) {

    let keys = Object.keys(input);

    for (let key of keys) {

        if (typeof input[key] != "object") {
            input[key] = '';
        } else {
            setEmpty(input[key]);
        }
    }
    return input;
}

function setCaseMetaData(caseRecord, httpReq, dataObject) {
    setEmpty(caseRecord);


    if (httpReq) {
        caseRecord = copyDataFromHTTPReq(caseRecord,httpReq)
    }

    if (dataObject) {
        for (let key in dataObject.userDetails) {
            caseRecord.customerDetails[key] = dataObject.userDetails[key];
        }

        for (let key in dataObject.requestedProducts) {
            caseRecord.prearrivalInformation.importItems[key] = dataObject.requestedProducts[key];
        }
    }
    caseRecord.caseId = getCaseId();
    caseRecord.caseStatus = "orderReceived";
    caseRecord.caseChangedAt = caseRecord.caseCreatedAt = new Date().toISOString();

}

function copyDataFromHTTPReq(target, source) {

    let keys = Object.keys(source);

    for (let key of keys) {

        if (typeof source[key] != "object") {
            target[key] = source[key];
        } else {
            target[key]= copyDataFromHTTPReq(target[key],source[key]);
        }
    }
    return target;
}