using System.Collections.Generic;
using System.IO;
using MadridBusMap.Model;
using Newtonsoft.Json;

namespace MadridBusMap.Data
{
    public class BusStopProvider
    {
        public List<Parada> Paradas { get; set; }

        public BusStopProvider()
        {
            Initialize();
        }

        private void Initialize()
        {
            Paradas = JsonConvert.DeserializeObject<List<Parada>>(File.ReadAllText("paradas.json"));
        }
    }
}