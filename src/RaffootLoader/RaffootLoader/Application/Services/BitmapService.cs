using System.Drawing;
using System.Runtime.Versioning;

namespace RaffootLoader.Application.Services
{
    [SupportedOSPlatform("windows")]
    public static class BitmapService
    {
        public static Bitmap ConvertToBitmap(string file)
        {
            Bitmap bitmap;
            using (var stream = File.Open(file, FileMode.Open))
            {
                var image = Image.FromStream(stream);
                bitmap = new Bitmap(image);
            }
            return bitmap;
        }

		public static Color GetAverageColor(IEnumerable<Bitmap> bitmaps)
        {
            var r = 0;
            var g = 0;
            var b = 0;

            var total = 0;

            foreach (var bitmap in bitmaps)
            {
                for (var i = 0; i < bitmap.Width; i++)
                {
                    for (int j = 0; j < bitmap.Height; j++)
                    {
                        var color = bitmap.GetPixel(i, j);

                        if (color.A == 0)
                            continue;

                        r += color.R;
                        g += color.G;
                        b += color.B;

                        total++;
                    }
                }
            }

            r /= total;
            g /= total;
            b /= total;

            return Color.FromArgb(r, g, b);
        }

		public static Color GetMostFrequentColor(IEnumerable<Bitmap> bitmaps)
		{
			var colorCount = new Dictionary<Color, int>();

			foreach (var bitmap in bitmaps)
			{
				for (var i = 0; i < bitmap.Width; i++)
				{
					for (var j = 0; j < bitmap.Height; j++)
					{
						var color = bitmap.GetPixel(i, j);

						if (color.A == 0 || new[] { color.R, color.G, color.B }.All(x => x == 0) || new[] { color.R, color.G, color.B }.All(x => x == 255))
							continue;

						if (colorCount.TryGetValue(color, out int value))
						{
							colorCount[color] = ++value;
						}
						else
						{
							colorCount[color] = 1;
						}
					}
				}
			}

            var result = colorCount.OrderByDescending(c => c.Value).First().Key;
            return result;
		}

		// https://stackoverflow.com/questions/2241447/make-foregroundcolor-black-or-white-depending-on-background
		// https://www.nbdtech.com/Blog/archive/2008/04/27/Calculating-the-Perceived-Brightness-of-a-Color.aspx
		public static int PerceivedBrightness(Color c)
        {
            return (int)Math.Sqrt(c.R * c.R * .241 + c.G * c.G * .691 + c.B * c.B * .068);
        }
    }
}
