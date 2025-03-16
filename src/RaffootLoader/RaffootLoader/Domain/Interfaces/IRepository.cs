using System.Linq.Expressions;

namespace RaffootLoader.Domain.Interfaces
{
    public interface IRepository
    {
        bool Delete<T>(int id);
        int DeleteAll<T>();
        List<T> Find<T>(Expression<Func<T, bool>> filter);
        List<T> GetAll<T>();
        T GetById<T>(int id);
        int Insert<T>(T entity);
        int InsertBulk<T>(IEnumerable<T> entities);
        int InsertMany<T>(IEnumerable<T> entities);
        bool Update<T>(T entity);
		bool Upsert<T>(T entity);
	}
}