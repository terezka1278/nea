using Neaproject.Data;
using System.Data.SQLite;

namespace Neaproject.Oop
{
    public class FindAvailableSlots
    {
        private readonly SqliteDataAccess _db;

        public FindAvailableSlots(SqliteDataAccess db)
        {
            _db = db;
        }

        // ★ SUBROUTINE: Find available days
        public List<string> FindAvailableDates(List<DayOfWeek> selectedDays,int searchWindow, int maxResults = 5)
        {
            var today = DateTime.Today;
            var results = new List<string>();

            using (var conn = _db.GetConnection())
            {
                conn.Open();

                for (int i = 1; i <= searchWindow; i++)
                {
                    var candidate = today.AddDays(i);

                    // only include chosen weekdays
                    if (!selectedDays.Contains(candidate.DayOfWeek))
                        continue;

                    // check if already booked
                    using (var cmd = new SQLiteCommand(
                        @"SELECT COUNT(*) FROM Appointments 
                          WHERE ScheduledDate = @d", conn))
                    {
                        cmd.Parameters.AddWithValue("@d",
                            candidate.ToString("yyyy-MM-dd"));

                        long count = (long)cmd.ExecuteScalar();

                        if (count <2 )
                        {
                            results.Add(candidate.ToString("yyyy-MM-dd"));

                            if (results.Count >= maxResults)
                                break;
                        }
                    }
                }
            }

            return results;
        }
    }
}
