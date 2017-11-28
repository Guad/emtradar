using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MadridBusMap.Data;
using MadridBusMap.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MadridBusMap.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class BusController : Controller
    {
        private static Lazy<BusStopProvider> _proveedor = new Lazy<BusStopProvider>(() => new BusStopProvider());

        [HttpGet("{id}")]
        public async Task<IEnumerable<BusArrive>> Get(int id)
        {
            var response = await Endpoints.GetEstimatesIncident(id);
            return response.arrives;
        }

        [HttpGet("paradas")]
        public IEnumerable<Parada> GetAllStops()
        {
            return _proveedor.Value.Paradas;
        }

        [HttpGet("paradas/{linea}")]
        public IEnumerable<Parada> GetStops(string linea)
        {
            return _proveedor.Value.Paradas.Where(p => p.Lines.Any(l => l.Name == linea));
        }

        [HttpGet("lineas")]
        public IEnumerable<Line> GetAllLineas()
        {
            return _proveedor.Value.Paradas.Select(p => p.Lines).Aggregate(new List<Line>(), (prev, next) =>
            {
                prev.AddRange(next);
                return prev;
            }).Distinct();
        }

        [HttpGet("line2label/{line}")]
        public object GetLabel(int line)
        {
            string label;
            if (LineLabel.TryGetLabel(line, out label))
                return new { found = true, value = label };
            return new { found = false };
        }

        [HttpGet("label2line/{label}")]
        public object GetLabel(string label)
        {
            int line;
            if (LineLabel.TryGetLine(label, out line))
                return new { found = true, value = line };
            return new { found = false };
        }
    }
}