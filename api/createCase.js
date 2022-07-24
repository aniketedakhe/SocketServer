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

    updateImporterDetails(caseRecord);

    if (caseRecord.caseType === 'expr') {
        generateTaskList(caseRecord);
        updateSupplierDetails(caseRecord);
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
function updateImporterDetails(caseRecord) {
    caseRecord.importerDetails = ({
        "abn": "88000014675",
        "cac": "",
        "name": "Woolworths Supermarkets",
        "addressLine1": "1 Woolworths Way",
        "addressLine2": "",
        "suburb": "Bella Vista",
        "state": "NSW",
        "city": "Sydney",
        "postCode": "2153",
        "countryCode": "AU",
        "phoneNo": "0288850000",
        "faxNo": "+0288850001",
        "eMail": "info@woolworths.com.au",
        "location": {
            "lat": -33.7365,
            "lon": 150.9495
        }
    })
}

function updateSupplierDetails(caseRecord) {
    caseRecord.importItems[0].supplierDetails = ({
        "abn": "1346549726",
        "cac": "",
        "name": "Southern Produce Ltd",
        "addressLine1": "37 NEWNHAM ROAD",
        "addressLine2": "",
        "suburb": "TAURANGA",
        "state": "NZ",
        "city": "",
        "postCode": "3174",
        "countryCode": "NZ",
        "phoneNo": "+64123465789",
        "faxNo": "+64123456789",
        "eMail": "Southernproduce@reason.com.au",
        "location": {
            "lat": 41.12,
            "lon": -71.34
        }
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