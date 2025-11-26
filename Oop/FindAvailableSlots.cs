using Neaproject.Data;
using System.Data.SQLite;

//TODO: NEED TO ADD POSTCODE LOCATION CHECK TO THIS 
namespace Neaproject.Oop
{
    public class FindAvailableSlots
    {
        private readonly SqliteDataAccess _db;

        public FindAvailableSlots(SqliteDataAccess db) //constructor to recieve SqlDataAccess and save it
        {
            _db = db;
        }

        //method to find available dates
        public List<string> FindAvailableDates(List<DayOfWeek> selectedDays,int timeFrame, int maxResults = 5) //methi=od that creates a list of dates based on preferred dates and a time frame 
        {
            var today = DateTime.Today; //get todays date
            var results = new List<string>(); //create list to store available date results

            using (var conn = _db.GetConnection()) //create and open database connection
            {
                conn.Open();
                
                for (int i = 1; i <= timeFrame; i++) 
                {
                    var candidate = today.AddDays(i);
                    if (!selectedDays.Contains(candidate.DayOfWeek)) // only include chosen days
                        continue; //skip if not in user's selected days

                    //SQL command to count how many appointments on this date
                    using (var cmd = new SQLiteCommand( 
                        @"SELECT COUNT(*) FROM Appointments 
                          WHERE ScheduledDate = @d", conn))
                    {
                        cmd.Parameters.AddWithValue("@d", candidate.ToString("yyyy-MM-dd")); // add date paraneter in correct format
                        long count = (long)cmd.ExecuteScalar(); //runs query and gets how many bookings already exist

                        if (count <2 ) //if less than two (either am or pm already booked or none booked)
                        {
                            results.Add(candidate.ToString("yyyy-MM-dd")); //add date to list
                            if (results.Count >= maxResults) //if enough results found (5)
                                break; //stop the loop
                        }
                    }
                }
            }

            return results; //return list of available dates
        }
    }
}

