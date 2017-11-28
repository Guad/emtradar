using System;
using System.Collections.Generic;

namespace MadridBusMap.Model
{
    public class Line : IEquatable<Line>
    {
        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((Line) obj);
        }

        public bool Equals(Line other)
        {
            return other != null &&
                   Name == other.Name &&
                   Direction == other.Direction;
        }

        public override int GetHashCode()
        {
            var hashCode = -2111805952;
            hashCode = hashCode * -1521134295 + EqualityComparer<string>.Default.GetHashCode(Name);
            hashCode = hashCode * -1521134295 + Direction.GetHashCode();
            return hashCode;
        }

        public string Name { get; set; }
        public int Direction { get; set; }

        public static bool operator ==(Line line1, Line line2)
        {
            return EqualityComparer<Line>.Default.Equals(line1, line2);
        }

        public static bool operator !=(Line line1, Line line2)
        {
            return !(line1 == line2);
        }
    }
}