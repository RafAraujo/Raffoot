using LiteDB;
using RaffootLoader.Data.Interfaces;
using System.Linq.Expressions;

namespace RaffootLoader.Data
{
    public class Repository<T>(ISettings settings) : IRepository<T>
    {
        public string TableName { get; set; }

		public IEnumerable<T> GetAll()
        {
            using var db = new LiteDatabase(settings.DbPath);
            var collection = db.GetCollection<T>(TableName);
            return collection.FindAll().ToList();
        }

        public T GetById(int id)
        {
            using var db = new LiteDatabase(settings.DbPath);
            var collection = db.GetCollection<T>(TableName);
            return collection.FindById(id);
        }

        public IEnumerable<T> Find(Expression<Func<T, bool>> filter)
        {
            using var db = new LiteDatabase(settings.DbPath);
            var collection = db.GetCollection<T>(TableName);
            return collection.Find(filter).ToList();
        }

        public int Insert(T entity)
        {
            using var db = new LiteDatabase(settings.DbPath);
            var collection = db.GetCollection<T>(TableName);
            return collection.Insert(entity);
        }

        public int InsertMany(IEnumerable<T> entities)
        {
            using var db = new LiteDatabase(settings.DbPath);
            var collection = db.GetCollection<T>(TableName);
            return collection.Insert(entities);
        }

        public int InsertBulk(IEnumerable<T> entities)
        {
            using var db = new LiteDatabase(settings.DbPath);
            var collection = db.GetCollection<T>(TableName);
            return collection.InsertBulk(entities);
        }

        public bool Update(T entity)
        {
            using var db = new LiteDatabase(settings.DbPath);
            var collection = db.GetCollection<T>(TableName);
            return collection.Update(entity);
        }

        public bool Delete(int id)
        {
            using var db = new LiteDatabase(settings.DbPath);
            var collection = db.GetCollection<T>(TableName);
            return collection.Delete(id);
        }
    }
}
