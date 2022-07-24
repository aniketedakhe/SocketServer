const { response } = require('express');
const { dbConfig } = require('../configuration/config');

module.exports = async function (req, res, ws) {
    var caseRecord = require('../configuration/tcaSchema');
    setCaseMetaData(caseRecord, req.body);//, dataObject)

    if (req) {

        res.setHeader('Content-Type', 'application/json');

        try {
            const client = await require('../api/dbConnect')(dbConfig.url);
            const db = await client.db(dbConfig.dbName);
            const caseHeader = await db.collection(dbConfig.dbCollectionName).insertOne(caseRecord);
            const responseMessage = caseRecord;
            res.statusCode = 200;
            res.write(JSON.stringify(responseMessage));

            if (ws) { //we have the websocket .. tell everyone that an item is added
                ws.emit('work-item-created', caseRecord) //this means agency said send to importer, customer sent to importer
            }
        }
        catch (e) {
            res.statusCode = 500;
            res.write((e.errmsg) ? JSON.stringify(e.errmsg) : JSON.stringify(e));
        }

        delete caseRecord._id;
        return res;
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
        caseRecord = copyDataFromHTTPReq(caseRecord, httpReq)
    }

    caseRecord.caseId = getCaseId();
    caseRecord.caseStatus = "orderReceived";
    caseRecord.caseChangedAt = caseRecord.caseCreatedAt = new Date().toISOString();
    caseRecord.caseCreatedBy = caseRecord.caseChangedBy = httpReq.customerDetails.eMail;
    const index = caseRecord.taskList.findIndex(x => x.id === '');
    if (index !== undefined) {
        caseRecord.taskList.splice(index, 1)
    }

    if (caseRecord.caseType === 'expr') {
        generateTaskList(caseRecord);
    }

}

function generateTaskList(caseRecord) {
    caseRecord.taskList.push({
        "id": 1,
        "conditionType": "ImportRequirement",
        "condition": "PhytosanitaryCertificate",
        "conditionCategory": "eCert",
        "mandatory": "yes",
        "mediaEvidence": "no",
        "inputCategory": "InputValue",
        "status": "",
        "value": "",
        "documentType": "eCert",
        "biconUrl": "https://bicon.agriculture.gov.au/BiconWeb4.0/ImportConditions/Conditions?EvaluatableElementId=622973&Path=UNDEFINED&UserContext=External&EvaluationStateId=5ac9096e-d197-48df-9c81-5279c5e02315&CaseElementPk=1748670&EvaluationPhase=ImportDefinition&HasAlerts=True&HasChangeNotices=False&IsAEP=False"
    })
}

function copyDataFromHTTPReq(target, source) {

    let keys = Object.keys(source);

    for (let key of keys) {

        if (typeof source[key] != "object" && typeof source[key] != "array") {
            target[key] = source[key];
        }
        else {
            target[key] = copyDataFromHTTPReq(target[key], source[key]);
        }
    }

    return target;
}