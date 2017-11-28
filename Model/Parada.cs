using System.Collections.Generic;

namespace MadridBusMap.Model
{
    public class Parada
    {
        public int Id { get; set; }
        public List<Line> Lines { get; set; }
        public double Lat { get; set; }
        public double Long { get; set; }
    }
}