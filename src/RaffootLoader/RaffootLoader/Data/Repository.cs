using LiteDB;
using RaffootLoader.Data.Interfaces;
using System.Linq.Expressions;

namespace RaffootLoader.Data
{
	public class Repository(ISettings settings) : IRepository
	{
		public bool Delete<T>(int id)
		{
			using var db = GetLiteDatabase();
			var collection = db.GetCollection<T>();
			return collection.Delete(id);
		}

		public int DeleteAll<T>()
		{
			using var db = GetLiteDatabase();
			var collection = db.GetCollection<T>();
			return collection.DeleteAll();
		}

		public List<T> Find<T>(Expression<Func<T, bool>> filter)
		{
			using var db = GetLiteDatabase();
			var collection = db.GetCollection<T>();
			return collection.Find(filter).ToList();
		}

		public List<T> GetAll<T>()
		{
			using var db = GetLiteDatabase();
			var collection = db.GetCollection<T>();
			return collection.FindAll().ToList();
		}

		public T GetById<T>(int id)
		{
			using var db = GetLiteDatabase();
			var collection = db.GetCollection<T>();
			return collection.FindById(id);
		}

		public int Insert<T>(T entity)
		{
			using var db = GetLiteDatabase();
			var collection = db.GetCollection<T>();
			return collection.Insert(entity);
		}

		public int InsertMany<T>(IEnumerable<T> entities)
		{
			using var db = GetLiteDatabase();
			var collection = db.GetCollection<T>();
			return collection.Insert(entities);
		}

		public int InsertBulk<T>(IEnumerable<T> entities)
		{
			using var db = GetLiteDatabase();
			var collection = db.GetCollection<T>();
			return collection.InsertBulk(entities);
		}

		public bool Update<T>(T entity)
		{
			using var db = GetLiteDatabase();
			var collection = db.GetCollection<T>();
			return collection.Update(entity);
		}

		public bool Upsert<T>(T entity)
		{
			using var db = GetLiteDatabase();
			var collection = db.GetCollection<T>();
			return collection.Upsert(entity);
		}

		protected virtual LiteDatabase GetLiteDatabase() => new(settings.DbPath);
	}
}
