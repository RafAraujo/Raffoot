using LiteDB;
using System.Linq.Expressions;

namespace RaffootLoader.Data
{
    public class Repository<T>
    {
        private readonly string _dbName;
        private readonly string _tableName;

        public Repository(string dbName)
        {
            _dbName = dbName;
        }

        public Repository(string dbName, string tableName) : this(dbName)
        {
            _tableName = tableName;
        }

        public IEnumerable<T> GetAll()
        {
            using var db = new LiteDatabase(_dbName);
            var collection = db.GetCollection<T>(_tableName);
            return collection.FindAll().ToList();
        }

        public T GetById(int id)
        {
            using var db = new LiteDatabase(_dbName);
            var collection = db.GetCollection<T>(_tableName);
            return collection.FindById(id);
        }

        public IEnumerable<T> Find(Expression<Func<T, bool>> filter)
        {
            using var db = new LiteDatabase(_dbName);
            var collection = db.GetCollection<T>(_tableName);
            return collection.Find(filter).ToList();
        }

        public int Insert(T entity)
        {
            using var db = new LiteDatabase(_dbName);
            var collection = db.GetCollection<T>(_tableName);
            return collection.Insert(entity);
        }

        public int InsertMany(IEnumerable<T> entities)
        {
            using var db = new LiteDatabase(_dbName);
            var collection = db.GetCollection<T>(_tableName);
            return collection.Insert(entities);
        }

        public int InsertBulk(IEnumerable<T> entities)
        {
            using var db = new LiteDatabase(_dbName);
            var collection = db.GetCollection<T>(_tableName);
            return collection.InsertBulk(entities);
        }

        public bool Update(T entity)
        {
            using var db = new LiteDatabase(_dbName);
            var collection = db.GetCollection<T>(_tableName);
            return collection.Update(entity);
        }

        public bool Delete(int id)
        {
            using var db = new LiteDatabase(_dbName);
            var collection = db.GetCollection<T>(_tableName);
            return collection.Delete(id);
        }
    }
}
