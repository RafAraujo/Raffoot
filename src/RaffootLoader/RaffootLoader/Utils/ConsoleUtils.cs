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
    }
}
