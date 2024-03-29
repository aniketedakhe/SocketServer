const { dbConfig, CaseStatus, CaseConstants } = require('../configuration/config');

module.exports = async function (req, res, ws) {
    try {
        
        const client = await require('../api/dbConnect')(dbConfig.url);
        const db = await client.db(dbConfig.dbName);

        var queryExprs = req.body.query;
        var length = queryExprs.length;
        var responseMessage;
        var changeParam = {};


        req.body.updateProperty.forEach(element => {
            var changeVar = element.propertyName;
            changeParam[changeVar] = element.propertyValue;  
        });
        // for (let property in req.body.updateProperty){
        
        // }

        changeParam[CaseConstants.caseChangedAt] = new Date().toISOString();

        
        // if (length < 2) {
        //     const caseHeader = await db.collection(dbConfig.dbCollectionName).updateOne(req.body.query[0], { $set: changeParam });
        //     responseMessage = caseHeader;
        // }
        // else {
            var myVar = "$and";
            var params = {};
            params[myVar] = req.body.query;
            const caseHeader = await db.collection(dbConfig.dbCollectionName).updateOne(params, { $set: changeParam });
            responseMessage = caseHeader;
        // }

        res.statusCode = 200;
        res.write(JSON.stringify(responseMessage));

        if (ws){ //we have the websocket .. tell everyone that an item is added
            req.body.updateProperty.forEach(element => {
            switch (element.propertyValue) {
                case CaseStatus.DspToAgency:
                    ws.emit('work-item-published', req.body.query[0]) //this means importer said send to agency
                    break;
                case CaseStatus.RxdFrmAgency:
                    ws.emit('work-item-created', req.body.query[0]) //this means agency said send to importer
                break;
                case CaseStatus.Released:
                    ws.emit('work-item-finalised', req.body.query[0]) //this means agency said release the item to customer
                break;

                default:
                    break;
            }
        });
        }
    }
    catch (e) {
        res.statusCode = 500;
        res.write((e.errmsg) ? JSON.stringify(e.errmsg) : JSON.stringify(e));
    }

//    delete caseRecord._id;
    return res;
}
    
//const caseHeader = await db.collection("ccraCase").updateOne({ caseId: req.body.caseId }, { $set: req.body });