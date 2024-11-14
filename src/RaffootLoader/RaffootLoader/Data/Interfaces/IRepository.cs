using System.Linq.Expressions;

namespace RaffootLoader.Data.Interfaces
{
    public interface IRepository<T>
    {
        bool Delete(int id);
        IEnumerable<T> Find(Expression<Func<T, bool>> filter);
        IEnumerable<T> GetAll();
        T GetById(int id);
        int Insert(T entity);
        int InsertBulk(IEnumerable<T> entities);
        int InsertMany(IEnumerable<T> entities);
        bool Update(T entity);
    }
}