using System;
using System.Collections.Generic;
using System.Linq;

namespace MadridBusMap.Data
{
    public static class LineLabel
    {
        public static bool TryGetLabel(int line, out string label)
        {
            return _map.TryGetValue(line, out label);
        }

        public static bool TryGetLine(string label, out int line)
        {
            line = 0;
            if (string.IsNullOrWhiteSpace(label))
                return false;
            return _mapReversed.Value.TryGetValue(label, out line);
        }

        private static Lazy<Dictionary<string, int>> _mapReversed
            = new Lazy<Dictionary<string, int>>(() => _map.ToDictionary(pair => pair.Value, pair => pair.Key));

        private static Dictionary<int, string> _map = new Dictionary<int, string>()
        {
            {68, "C1"},
            {69, "C2"},
            {90, "E"},
            {91, "F"},
            {92, "G"},
            {93, "A"},
            {96, "H"},
            {99, "U"},
            {372, "172SF"},
            {401, "E1"},
            {402, "E2"},
            {403, "E3"},
            {451, "T11"},
            {452, "T23"},
            {453, "T32"},
            {454, "T31"},
            {455, "T61"},
            {456, "T41"},
            {457, "T62"},
            {481, "H1"},
            {501, "N1"},
            {502, "N2"},
            {503, "N3"},
            {504, "N4"},
            {505, "N5"},
            {506, "N6"},
            {507, "N7"},
            {508, "N8"},
            {509, "N9"},
            {510, "N10"},
            {511, "N11"},
            {512, "N12"},
            {513, "N13"},
            {514, "N14"},
            {515, "N15"},
            {516, "N16"},
            {517, "N17"},
            {518, "N18"},
            {519, "N19"},
            {520, "N20"},
            {521, "N21"},
            {522, "N22"},
            {523, "N23"},
            {524, "N24"},
            {525, "N25"},
            {526, "N26"},
            {527, "N27"},
            {601, "M1"},
            {602, "M2"},
            {661, "SE661"},
            {702, "SE702"},
            {704, "SE704"},
            {730, "SE730"},
            {766, "SE766"},
            {799, "SE799"}
        };
    }
}