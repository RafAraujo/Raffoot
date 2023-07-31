using System.Globalization;

namespace RaffootLoader.Utils
{
    public static class StringExtensions
    {
        private static readonly CultureInfo _cultureInfo = CultureInfo.InvariantCulture;

        public static bool IsTitleCase(this string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return false;
            }

            return text == CultureInfo.CurrentCulture.TextInfo.ToTitleCase(text);
        }

        public static string ToTitleCase(this string text)
        {
            return _cultureInfo.TextInfo.ToTitleCase(text);
        }

        public static string WithFirstCharUppercase(this string input) => input switch
        {
            null => throw new ArgumentNullException(nameof(input)),
            "" => throw new ArgumentException($"{nameof(input)} cannot be empty", nameof(input)),
            _ => string.Concat(input[0].ToString().ToUpper(), input.AsSpan(1))
        };
    }
}
