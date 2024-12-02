using HtmlAgilityPack;
using RaffootLoader.Utils;
using System.Net;

namespace RaffootLoader.Services.Abstract
{
	public abstract class WebScraperServiceBase
	{
		public static async Task<HtmlDocument> GetHtmlDocument(HttpClient client, string url)
		{
			HttpResponseMessage message;
			HtmlDocument doc;
			try
			{
				message = await client.GetAsync(url).ConfigureAwait(false);
				message.EnsureSuccessStatusCode();
				var html = await message.Content.ReadAsStringAsync().ConfigureAwait(false);
				doc = new HtmlDocument();
				doc.LoadHtml(html);
			}
			catch (HttpRequestException ex)
			{
				ConsoleUtils.ShowException(ex);
				ConsoleUtils.WriteWarning("Waiting...");

				await Task.Delay(TimeSpan.FromSeconds(5)).ConfigureAwait(false);
				return await GetHtmlDocument(client, url).ConfigureAwait(false);
			}
			return doc;
		}

		public static HtmlDocument GetHtmlDocument(string filePath)
		{
			var html = File.ReadAllText(filePath);
			var doc = new HtmlDocument();
			doc.LoadHtml(html);
			return doc;
		}

		public static HttpClient GetHttpClient(string baseUrl, string cookies)
		{
			var cookieContainer = new CookieContainer();
			var handler = new HttpClientHandler
			{
				UseCookies = true,
				CookieContainer = cookieContainer,
			};

			var client = new HttpClient(handler);
			client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/130.0.0.0 Safari/537.36");
			client.DefaultRequestHeaders.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");
			client.DefaultRequestHeaders.Add("Accept-Language", "en-US,en;q=0.5");
			client.DefaultRequestHeaders.Add("Connection", "keep-alive");
			client.DefaultRequestHeaders.Add("Upgrade-Insecure-Requests", "1");

			foreach (var cookie in cookies.Replace(" ", string.Empty).Split(';'))
			{
				var parts = cookie.Split('=');
				cookieContainer.Add(new Uri(baseUrl), new Cookie(parts[0], parts[1]));
			}

			return client;
		}

		public static HttpClient GetHttpClient()
		{
			var client = new HttpClient();
			client.DefaultRequestHeaders.Add("User-Agent", "C# App");
			return client;
		}
	}
}
