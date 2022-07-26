const { dbConfig } = require('../configuration/config');

module.exports = async function (req, res) {
    try {
    const client = await require('../api/dbConnect') (dbConfig.url);
    const db = await client.db(dbConfig.dbName);
    const projection = { 'caseId' : true , 'caseType' : true , 'caseStatus' : true, 'caseCreatedAt' : true, 'caseUpdatedAt' : true, 'prearrivalInformation.importItems.goodsDescr': true,
    'prearrivalInformation.importItems.imageSrc': true, 'prearrivalInformation.importItems.imageAlt': true, 'prearrivalInformation.importItems.quantityDetails.qty': true, 
    'prearrivalInformation.importItems.quantityDetails.qtyUnit': true};
    const cases = await db.collection(dbConfig.dbCollectionName).find(req.body? req.body :{},{ projection : projection } ).sort({ "caseChangedAt": -1 }).toArray();
    const responseMessage = cases;
    //res.statusCode = req.method === 'GET' ? 200  : 204;
    res.statusCode = 200;    
    res.setHeader('Content-type','application/json')
    res.write(JSON.stringify(responseMessage)); 
}
catch (e) {
    res.statusCode = 500;
    res.write((e.errmsg) ? JSON.stringify(e.errmsg) : JSON.stringify(e));
}
//    delete caseRecord._id;
return res;
}