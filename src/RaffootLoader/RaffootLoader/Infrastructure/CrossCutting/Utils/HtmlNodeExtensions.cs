using HtmlAgilityPack;

namespace RaffootLoader.Infrastructure.CrossCutting.Utils
{
    public static class HtmlNodeExtensions
    {
        public static bool IsVisible(this HtmlNode node)
        {
            var attribute = node.Attributes["style"];

            bool thisVisible = false;

            if (attribute == null || CheckStyleVisibility(attribute.Value))
                thisVisible = true;

            if (thisVisible && node.ParentNode != null)
                return node.ParentNode.IsVisible();

            return thisVisible;
        }

        private static bool CheckStyleVisibility(string style)
        {
            if (string.IsNullOrWhiteSpace(style))
                return true;

            var keys = ParseHtmlStyleString(style);

            if (keys.ContainsKey("display"))
            {
                string display = keys["display"];
                if (display != null && display == "none")
                    return false;
            }

            if (keys.ContainsKey("visibility"))
            {
                string visibility = keys["visibility"];
                if (visibility != null && visibility == "hidden")
                    return false;
            }

            return true;
        }

        public static Dictionary<string, string> ParseHtmlStyleString(string style)
        {
            var result = new Dictionary<string, string>();

            style = style.Replace(" ", "").ToLowerInvariant();

            string[] settings = style.Split(new char[] { ';' }, StringSplitOptions.RemoveEmptyEntries);

            foreach (string s in settings)
            {
                if (!s.Contains(':'))
                    continue;
                string[] data = s.Split(':');
                result.Add(data[0], data[1]);
            }

            return result;
        }
    }
}
