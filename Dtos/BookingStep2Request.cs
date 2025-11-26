// Neaproject/Dtos/BookingStep2Request.cs
using System.Collections.Generic;

namespace Neaproject.Dtos
{
    public class BookingStep2Request
    {
        public string JobId { get; set; } = string.Empty;
        public List<string> Days { get; set; } = new List<string>();
    }
    public class BookingStep2Response
    {
        public string JobId { get; set; } = "";
        public List<string> SuggestedDates { get; set; } = new();
    }

    public class BookingStep2ConfirmRequest
    {
        public string JobId { get; set; } = "";
        public string SelectedDate { get; set; } = "";
    }
}
