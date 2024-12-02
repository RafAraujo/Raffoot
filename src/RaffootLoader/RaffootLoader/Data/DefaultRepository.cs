using LiteDB;
using RaffootLoader.Data.Interfaces;

namespace RaffootLoader.Data
{
	public class DefaultRepository(ISettings settings) : Repository(settings.DbPath)
	{
		protected override LiteDatabase GetLiteDatabase() => new(settings.DbPath);
	}
}
