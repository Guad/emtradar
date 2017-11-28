using System.Threading.Tasks;
using MadridBusMap.Model;

namespace MadridBusMap.Data
{
    public class Endpoints
    {
        public static async Task<ApiResponse> GetEstimatesIncident(int stopId)
        {
            var request = new ApiRequest("/media/GetEstimatesIncident.php");

            request.Data.Add("idStop", stopId.ToString());

            request.Data.Add("Text_StopRequired_YN", "N");
            request.Data.Add("Audio_StopRequired_YN", "N");
            request.Data.Add("Text_EstimationsRequired_YN", "Y");
            request.Data.Add("Audio_EstimationsRequired_YN", "N");
            request.Data.Add("Text_IncidencesRequired_YN", "N");
            request.Data.Add("Audio_IncidencesRequired_YN", "N");
            request.Data.Add("cultureInfo", "EN");

            return await request.SendAsync();
        }
    }
}