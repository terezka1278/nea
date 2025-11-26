namespace Neaproject.Models
{
    public class Job
    {
        public string JobID { get; set; }       // from Jobs
        public string ClientName { get; set; }  // FirstName + LastName
        public string ScheduledDate { get; set; } // YYYY-MM-DD from Appointments
        public string Status { get; set; }
        public string ServiceName { get; set; }
        public string Address { get; set; }
        public string Postcode { get; set; }
    }
}
