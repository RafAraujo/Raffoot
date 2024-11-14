using LiteDB;
using RaffootLoader.Data.Interfaces;
using System.Linq.Expressions;

namespace RaffootLoader.Data
{
    public class Repository<T>(ISettings settings) : IRepository<T>
    {
		public IEnumerable<T> GetAll()
        {
            using var db = new LiteDatabase(settings.DbPath);
            var collection = db.GetCollection<T>();
            return collection.FindAll().ToList();
        }

        public T GetById(int id)
        {
            using var db = new LiteDatabase(settings.DbPath);
            var collection = db.GetCollection<T>();
            return collection.FindById(id);
        }

        public IEnumerable<T> Find(Expression<Func<T, bool>> filter)
        {
            using var db = new LiteDatabase(settings.DbPath);
            var collection = db.GetCollection<T>();
            return collection.Find(filter).ToList();
        }

        public int Insert(T entity)
        {
            using var db = new LiteDatabase(settings.DbPath);
            var collection = db.GetCollection<T>();
            return collection.Insert(entity);
        }

        public int InsertMany(IEnumerable<T> entities)
        {
            using var db = new LiteDatabase(settings.DbPath);
            var collection = db.GetCollection<T>();
            return collection.Insert(entities);
        }

        public int InsertBulk(IEnumerable<T> entities)
        {
            using var db = new LiteDatabase(settings.DbPath);
            var collection = db.GetCollection<T>();
            return collection.InsertBulk(entities);
        }

        public bool Update(T entity)
        {
            using var db = new LiteDatabase(settings.DbPath);
            var collection = db.GetCollection<T>();
            return collection.Update(entity);
        }

        public bool Delete(int id)
        {
            using var db = new LiteDatabase(settings.DbPath);
            var collection = db.GetCollection<T>();
            return collection.Delete(id);
        }
    }
}
