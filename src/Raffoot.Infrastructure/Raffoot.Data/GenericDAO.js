class GenericDAO {
    constructor(connection) {
        this._connection = connection;
    }

    async insertAsync(entity, store = null) {
        if (store == null) {
            store = entity.constructor.name;
        }

        return new Promise((resolve, reject) => {
            const request = this._connection
                .transaction([store], 'readwrite')
                .objectStore(store)
                .add(entity);

            request.onsuccess = () => resolve(request.result);

            request.onerror = error => reject(error);
        });
    }

    async insertManyAsync(entities) {
        return new Promise((resolve, reject) => {
            const transaction = this._connection.transaction(entities.map(e => e.constructor.name).distinct(), 'readwrite')

            const requests = [];
            for (const entity of entities) {
                const request = transaction.objectStore(entity.constructor.name).add(entity);
                requests.push(request);
            }

            transaction.oncomplete = () => resolve(requests.map(r => r.result));
            transaction.onerror = error => reject(error);
        });
    }

    async updateAsync(entity, key, store = null) {
        if (store == null) {
            store = entity.constructor.name;
        }

        return new Promise((resolve, reject) => {
            const request = this._connection
                .transaction([store], 'readwrite')
                .objectStore(store)
                .put(entity, key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = error => reject(error);
        });
    }

    async updateManyAsync(entities) {
        return new Promise((resolve, reject) => {
            const transaction = this._connection.transaction(entities.map(e => e.constructor.name).distinct(), 'readwrite')

            transaction.oncomplete = () => resolve(entities);
            transaction.onerror = error => reject(error);

            entities.forEach(e => transaction.objectStore(e.constructor.name).put(e, e.id));
        });
    }

    async getAllAsync(store) {
        return new Promise((resolve, reject) => {
            const request = this._connection
                .transaction([store], 'readonly')
                .objectStore(store)
                .getAll();

            request.onsuccess = e => resolve(e.target.result);

            request.onerror = error => reject(error);
        });
    }

    async getAllWithKeysAsync(store) {
        return new Promise((resolve, reject) => {
            const objects = [];

            const request = this._connection
                .transaction([store], 'readonly')
                .objectStore(store)
                .openCursor();

            request.onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    const key = cursor.primaryKey;
                    const value = cursor.value;
                    const object = { key, value };
                    objects.push(object);
                    cursor.continue();
                }
                else {
                    resolve(objects)
                }
            }

            request.onerror = error => reject(error);
        });
    }

    async getByIdAsync(store, id) {
        return new Promise((resolve, reject) => {
            const getById = this._connection
                .transaction([store], 'readonly')
                .objectStore(store)
                .get(id);

            getById.onsuccess = e => resolve(e.target.result);

            getById.onerror = error => reject(error);
        });
    }

    async deleteAsync(store, id) {
        return new Promise((resolve, reject) => {
            const request = this._connection
                .transaction([store], 'readwrite')
                .objectStore(store)
                .delete(id);

            request.onsuccess = () => resolve();

            request.onerror = error => reject(error);
        });

    }
}