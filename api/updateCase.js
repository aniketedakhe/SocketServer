const { dbConfig } = require('../configuration/config');

module.exports = async function (req, res) {
    try {
        
        const client = await require('../api/dbConnect')(dbConfig.url);
        const db = await client.db(dbConfig.dbName);

        var queryExprs = req.body.query;
        var length = queryExprs.length;
        var responseMessage;

        var changeVar = req.body.updateProperty.propertyName;
        var changeParam = {};
        changeParam[changeVar] = req.body.updateProperty.propertyValue;

        if (length < 2) {
            const caseHeader = await db.collection(dbConfig.dbCollectionName).updateOne(req.body.query[0], { $set: changeParam });
            let responseMessage = caseHeader;
        }
        else {
            var myVar = "$and";
            var params = {};
            params[myVar] = req.body.query;
            const caseHeader = await db.collection(dbConfig.dbCollectionName).updateOne(params, { $set: changeParam });
            responseMessage = caseHeader;
        }
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
    
//const caseHeader = await db.collection("ccraCase").updateOne({ caseId: req.body.caseId }, { $set: req.body });