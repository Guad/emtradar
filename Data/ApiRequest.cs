using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using MadridBusMap.Model;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace MadridBusMap.Data
{
    public class ApiRequest
    {
        private const string _uri = @"https://openbus.emtmadrid.es:9443/emt-proxy-server/last";

        public string IdClient;
        public string Passkey;
        public string Endpoint;

        public Dictionary<string, string> Data;

        public ApiRequest(string endpoint)
        {
            IdClient = "EMT.SERVICIOS.IPHONE.2.0";
            Passkey = "DC352ADB-F31D-41E5-9B95-CCE11B7921F4"; // Public key
            Endpoint = endpoint;
            Data = new Dictionary<string, string>();

        }

        public async Task<ApiResponse> SendAsync()
        {
            JObject json;
            HttpResponseMessage response;
            ApiResponse apiResp;

            Data.Add("idClient", IdClient);
            Data.Add("passKey", Passkey);

            HttpContent content = new FormUrlEncodedContent(Data.ToArray());

            using (HttpClient client = new HttpClient())
            {
                response = await client.PostAsync(_uri + Endpoint, content);
            }

            using (var stream = new MemoryStream())
            {
                await response.Content.CopyToAsync(stream);
                stream.Seek(0, SeekOrigin.Begin);
                using (StreamReader reader = new StreamReader(stream))
                using (JsonTextReader jsonReader = new JsonTextReader(reader))
                {
                    json = JObject.Load(jsonReader);
                }
            }

            apiResp = new ApiResponse();
            apiResp.errorCode = json["errorCode"].Value<int>();
            apiResp.description = json["description"].Value<string>();

            if (apiResp.errorCode == 0)
            {
                JObject singleArrive = json["arrives"]["arriveEstimationList"]["arrive"] as JObject;
                JArray arrives = json["arrives"]["arriveEstimationList"]["arrive"] as JArray;
                apiResp.arrives = new List<BusArrive>();

                if (singleArrive != null)
                {
                    BusArrive barr = new BusArrive();
                    barr.busId = singleArrive["busId"].Value<int>();
                    barr.lineId = singleArrive["lineId"].Value<string>();
                    barr.busDistance = singleArrive["busDistance"].Value<int>();
                    barr.busTimeLeft = singleArrive["busTimeLeft"].Value<int>();
                    barr.destination = singleArrive["destination"].Value<string>();
                    barr.longitude = singleArrive["longitude"].Value<double>();
                    barr.latitude = singleArrive["latitude"].Value<double>();

                    apiResp.arrives.Add(barr);
                }
                else
                    foreach (JToken arrive in arrives)
                    {
                        BusArrive barr = new BusArrive();
                        barr.busId = arrive["busId"].Value<int>();
                        barr.lineId = arrive["lineId"].Value<string>();
                        barr.busDistance = arrive["busDistance"].Value<int>();
                        barr.busTimeLeft = arrive["busTimeLeft"].Value<int>();
                        barr.destination = arrive["destination"].Value<string>();
                        barr.longitude = arrive["longitude"].Value<double>();
                        barr.latitude = arrive["latitude"].Value<double>();

                        apiResp.arrives.Add(barr);
                    }
            }

            return apiResp;

        }
    }
}