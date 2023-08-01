namespace RaffootLoader.Utils
{
    public static class ConsoleUtils
    {
        public static void ShowException(Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine();
            Console.WriteLine(ex);
            Console.ResetColor();
        }

        public static void ShowProgress(double current, double total, string message = null)
        {
            Console.Write("\r{0}{1}%", message, Math.Round(current / total * 100));
        }
    }
}
