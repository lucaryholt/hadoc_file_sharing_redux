const MongoDB = require('mongodb');

const insertPromise = async function (collectionName, data) {
    return new Promise((resolve, reject) => {
        MongoDB.connect(process.env.DB_CONNECTION_STRING, { useUnifiedTopology: true }, (error, client) => {
            if (error) throw new Error();

            const db = client.db('hadoc_redux');
            const collection = db.collection(collectionName);

            collection.insertOne(data, (error, result) => {
                if (error) {
                    reject();
                }

                client.close();

                resolve(result);
            })
        });
    });
}

const findPromise = async function (collectionName, query) {
    return new Promise((resolve, reject) => {
        MongoDB.connect(process.env.DB_CONNECTION_STRING, { useUnifiedTopology: true }, (error, client) => {
            if (error) throw new Error();

            const db = client.db('hadoc_redux');
            const collection = db.collection(collectionName);

            collection.find(query).toArray((error, result) => {
                if (error) {
                    reject();
                }

                client.close();

                resolve(result);
            });
        });
    });
}

const updatePromise = async function (collectionName, query, data) {
    return new Promise((resolve, reject) => {
        MongoDB.connect(process.env.DB_CONNECTION_STRING, { useUnifiedTopology: true }, (error, client) => {
            if (error) throw new Error();

            const db = client.db('hadoc_redux');
            const collection = db.collection(collectionName);

            collection.updateOne(query, { $set: data }, (error, result) => {
                if (error) {
                    reject();
                }

                resolve(result);
            });
        });
    });
}

async function find(collectionName, query){
    return await findPromise(collectionName, query);
}

async function insert(collectionName, data){
    return await insertPromise(collectionName, data);
}

async function update(collectionName, query, data){
    return await updatePromise(collectionName, query, data);
}

module.exports = {
    find,
    insert,
    update
}