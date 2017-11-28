using System.Collections.Generic;

namespace MadridBusMap.Model
{
    public class ApiResponse
    {
        public int errorCode { get; set; }
        public string description { get; set; }
        public List<BusArrive> arrives { get; set; }
    }
}