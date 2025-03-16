namespace RaffootLoader.Infrastructure.CrossCutting.Utils
{
    public static class ConsoleUtils
    {
        public static void ShowException(Exception ex) => WriteError(ex.ToString());

        public static void ShowProgress(double current, double total, string message = null)
        {
			ClearCurrentConsoleLine();
            Console.Write("\r{0}{1}%", message, Math.Round(current / total * 100));
        }

        public static void WriteError(string message) => WriteMessage(message, ConsoleColor.Red);

		public static void WriteWarning(string message) => WriteMessage(message, ConsoleColor.Yellow);

		private static void WriteMessage(string message, ConsoleColor color)
		{
			Console.ForegroundColor = color;
			Console.WriteLine("\n{0}\n", message);
			Console.ResetColor();
		}

		public static void ClearCurrentConsoleLine()
		{
			int currentLineCursor = Console.CursorTop;
			Console.SetCursorPosition(0, Console.CursorTop);
			Console.Write(new string(' ', Console.WindowWidth));
			Console.SetCursorPosition(0, currentLineCursor);
		}
	}
}
