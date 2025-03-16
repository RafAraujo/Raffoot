let ConnectionFactory = (function () {
    let _connection = null;
    let _close = null;

    return class ConnectionFactory {

        static createDatabaseAsync(dbName, stores, dbVersion = null, autoIncrement = true) {
            return new Promise((resolve, reject) => {
                let request = indexedDB.open(dbName, dbVersion ?? 1);

                request.onupgradeneeded = e => {
                    let connection = e.target.result;
                    ConnectionFactory.createStores(connection, stores, autoIncrement);
                };

                request.onsuccess = e => {
                    let connection = e.target.result;
                    connection.close();
                    resolve();
                };

                request.onerror = e => reject(e.target.error);
            });
        }

        static createStores(connection, stores, autoIncrement = true) {
            for (const store of stores) {
                if (connection.objectStoreNames.contains(store)) {
                    connection.deleteObjectStore(store);
                }
                connection.createObjectStore(store, { autoIncrement: autoIncrement });
            }
        }

        static dropDatabaseAsync(dbName) {
            return new Promise((resolve, reject) => {
                let request = indexedDB.deleteDatabase(dbName);

                request.onsuccess = e => {
                    resolve(e.target.result);
                };

                request.onerror = e => reject(e.target.error);
            });
        }

        static getConnectionAsync(dbName, dbVersion = null) {
            return new Promise((resolve, reject) => {
                let request = indexedDB.open(dbName, dbVersion ?? 1);

                request.onsuccess = e => {
                    if (!_connection) {
                        _connection = e.target.result;
                        _close = _connection.close.bind(_connection);
                        _connection.close = () => { throw new Error('Use the method closeConnection)'); };
                    }
                    resolve(_connection);
                };

                request.onerror = e => reject(e.target.error);
            });
        }

        static closeConnection() {
            if (_connection) {
                _close();
                _connection = null;
                _close = null;
            }
        }
    }
})();