using System.Drawing;

namespace RaffootLoader.Infrastructure.CrossCutting.Utils
{
    public static class ColorExtensions
    {
        public static string ToHexString(this Color color)
        {
            return $"#{color.R:X2}{color.G:X2}{color.B:X2}";
        }

        public static string ToRgbString(this Color color)
        {
            return $"rgb({color.R},{color.G},{color.B})";
        }
    }
}
