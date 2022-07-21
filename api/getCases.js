const { dbConfig } = require('../configuration/config');

module.exports = async function (req, res) {
    try {
    const client = await require('../api/dbConnect') (dbConfig.url);
    const db = await client.db(dbConfig.dbName);

    console.log(req.body);
    const cases = await db.collection(dbConfig.dbCollectionName).find(req.body? req.body :{}).toArray();
    const responseMessage = cases;
    //res.statusCode = req.method === 'GET' ? 200  : 204;
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