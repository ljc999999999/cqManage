const MongoClient = require("mongodb").MongoClient;

const url = "mongodb://127.0.0.1:27017";
const ObjectId=require('mongodb').ObjectId;
// Database Name
const dbName = "myproject";
module.exports = {
  insertOne(collectionName, query, callback) {
    MongoClient.connect(url,{ useNewUrlParser: true }, function(err, client) {
      const db = client.db(dbName);
      // Get the documents collection
      const collection = db.collection(collectionName);
      // Insert some documents
      collection.insertOne(query, (err, result) => {
        callback(result);
        client.close();
      });
    });
  },
  find(collectionName, query, callback) {
    MongoClient.connect(url,{ useNewUrlParser: true }, (err, client)=> {
      const db = client.db(dbName);
      // Get the documents collection
      const collection = db.collection(collectionName);
      // Insert some documents
      collection.find(query).toArray((err, docs)=> {
        callback(docs)
        client.close();
      });
    });
  },
  updateOne(collectionName, query, update,callback) {
    MongoClient.connect(url,{ useNewUrlParser: true }, (err, client)=> {
      const db = client.db(dbName);
      // Get the documents collection
      const collection = db.collection(collectionName);
      // Insert some documents
      collection.updateOne(query
        , { $set: update }, (err, result)=> {
       
        callback(result);
        client.close();
      });
    });
  },
  deleteOne(collectionName, query,callback) {
    MongoClient.connect(url,{ useNewUrlParser: true }, (err, client)=> {
      const db = client.db(dbName);
      // Get the documents collection
      const collection = db.collection(collectionName);
      // Insert some documents
      collection.deleteOne(query
        , (err, result)=> {
       
        callback(result);
        client.close();
      });
    });
  },
  ObjectId
}
  
 

