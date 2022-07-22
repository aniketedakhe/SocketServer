module.exports = {

    dbConfig: {
        url: "mongodb://sandboxril.australiasoutheast.cloudapp.azure.com:27017/?readPreference=primary&ssl=false&directConnection=true",
        hostname: "sandboxril.australiasoutheast.cloudapp.azure.com",
        protocol: "mongodb",
        port: 27017,
        uriOptions: "readPreference=primary&ssl=false&directConnection=true",
        dbName: "tcaDb",
        dbCollectionName: "tcaCollection"
    },
    CaseStatus: {
        FieldName : "caseStatus",
        OrderRx : "orderReceived",
        DspToAgency : "dispatchedToDawe",
        RxdFrmAgency : "receivedFromDawe",
        Inspection : "inspection",
        Released : "released",
        OrderFxd : "orderFulfilled",
        OrderDnd : "orderDenied",
      },
      CaseConstants: {
        caseCreatedAt : 'caseCreatedAt',
        caseChangedAt : 'caseChangedAt'
      }
};



