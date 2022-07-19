const { dbConfig } = require('../configuration/config');

module.exports = async function (req, res) {


    var selection = [];
    var exclusion = [];
    var projection = {};
    var caseHeader = {};

    if (req.query.selection) {
        selection = req.query.selection.split(",");
        for (const key in selection) {
            projection[selection[key]] = selection[key];
        }
    }
    else if (req.query.exclusion) {
        exclusion = req.query.exclusion.split(",");
        for (const key in exclusion) {
            projection[exclusion[key]] = 0;
        }
    }
    try {
        var caseId = req.query.caseId;
        if (!caseId) { caseId = req.body.id };   //keep original logic

        const client = await require('../api/dbConnect')(dbConfig.url);
        const db = await client.db(dbConfig.dbName);
        
        if (req.query.selection || req.query.exclusion) {
            const caseHeaderArray = await db.collection(dbConfig.dbCollectionName).find({ "caseId": caseId }).project(projection).toArray();
            if (caseHeaderArray && caseHeaderArray.length > 0) {
                caseHeader = caseHeaderArray[0];
            }
        } else {
            caseHeader = await db.collection(dbConfig.dbCollectionName).findOne({ "caseId": caseId });
        }
        delete caseHeader._id;

        const responseMessage = caseHeader;

        res.statusCode = 200;
        res.write(JSON.stringify(responseMessage));

    }
    catch (e) {
        res.statusCode = 500;
        res.write((e.errmsg) ? JSON.stringify(e.errmsg) : JSON.stringify(e));
    }
    //    delete caseRecord._id;
    return res;
}