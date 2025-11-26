using Microsoft.AspNetCore.Mvc;
using Neaproject.Data;
using Neaproject.Dtos;
using Neaproject.Oop;
using System;
using System.Collections.Generic;
using System.Data.SQLite;

namespace Neaproject.Controllers
{
    [ApiController]
    [Route("api/booking")]
    public class BookingController : ControllerBase
    {
        private readonly SqliteDataAccess _db;

        public BookingController(SqliteDataAccess db)
        {
            _db = db;
        }

        // ------------------ STEP 1 ------------------
        [HttpPost("step1")]
        public IActionResult Step1([FromBody] BookingStep1Request model)
        {
            if (model == null)
                return BadRequest(new { message = "No data sent." });

            if (string.IsNullOrWhiteSpace(model.FirstName) ||
                string.IsNullOrWhiteSpace(model.LastName) ||
                string.IsNullOrWhiteSpace(model.Email) ||
                string.IsNullOrWhiteSpace(model.PhoneNum) ||
                string.IsNullOrWhiteSpace(model.Address) ||
                string.IsNullOrWhiteSpace(model.Postcode) ||
                string.IsNullOrWhiteSpace(model.Service) ||
                string.IsNullOrWhiteSpace(model.Summary) ||
                model.Points <= 0)
            {
                return BadRequest(new { message = "Please fill in all required fields." });
            }

            try
            {
                using (var conn = _db.GetConnection())
                {
                    conn.Open();
                    using (var tx = conn.BeginTransaction())
                    {
                        string clientIdToUse;

                        // ----- USER CLAIMS TO BE LOGGED IN -----
                        if (!string.IsNullOrWhiteSpace(model.ClientId))
                        {
                            using (var cmd = new SQLiteCommand(
                                "SELECT Email FROM Clients WHERE ClientID = @ClientID;", conn, tx))
                            {
                                cmd.Parameters.AddWithValue("@ClientID", model.ClientId);
                                var emailInDb = cmd.ExecuteScalar() as string;

                                if (emailInDb == null)
                                    return BadRequest(new { message = "Login invalid.", requiresLogin = true });

                                if (!string.Equals(emailInDb, model.Email.Trim(), StringComparison.OrdinalIgnoreCase))
                                    return BadRequest(new { message = "Email mismatch.", requiresLogin = true });

                                clientIdToUse = model.ClientId;
                            }
                        }
                        else
                        {
                            // ----- USER NOT LOGGED IN -----
                            using (var checkCmd = new SQLiteCommand(
                                "SELECT ClientID FROM Clients WHERE Email = @Email;", conn, tx))
                            {
                                checkCmd.Parameters.AddWithValue("@Email", model.Email);
                                var exists = checkCmd.ExecuteScalar();

                                if (exists != null)
                                    return BadRequest(new { message = "Account exists. Please log in.", requiresLogin = true });

                                return BadRequest(new { message = "No account found. Please create one.", requiresAccount = true });
                            }
                        }

                        // ----- CREATE JOB -----
                        string jobId = Guid.NewGuid().ToString();

                        using (var insertJob = new SQLiteCommand(@"
                            INSERT INTO Jobs (JobID, ClientID, ServiceID, DateStarted, DateFinished, Status, Summary, NumOfPoints)
                            VALUES (@JobID, @ClientID, @ServiceID, NULL, NULL, 'Not Started', @Summary, @NumOfPoints);
                        ", conn, tx))
                        {
                            insertJob.Parameters.AddWithValue("@JobID", jobId);
                            insertJob.Parameters.AddWithValue("@ClientID", clientIdToUse);
                            insertJob.Parameters.AddWithValue("@ServiceID", model.Service);
                            insertJob.Parameters.AddWithValue("@Summary", model.Summary);
                            insertJob.Parameters.AddWithValue("@NumOfPoints", model.Points);
                            insertJob.ExecuteNonQuery();
                        }

                        tx.Commit();

                        return Ok(new { clientId = clientIdToUse, jobId });
                    }
                }
            }
            catch
            {
                return StatusCode(500, new { message = "Server error." });
            }
        }


        // ------------------ STEP 2 (find dates) ------------------
        [HttpPost("step2")]
        public IActionResult Step2([FromBody] BookingStep2Request model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.JobId))
                return BadRequest(new { message = "Invalid step 2 data." });

            if (model.Days == null || model.Days.Count == 0)
                return BadRequest(new { message = "Select at least one day." });

            var days = new List<DayOfWeek>();
            foreach (string d in model.Days)
                if (Enum.TryParse(d, true, out DayOfWeek result))
                    days.Add(result);

            var finder = new FindAvailableSlots(_db);
            var available = finder.FindAvailableDates(days, 21);

            return Ok(new { jobId = model.JobId, suggestedDates = available });
        }


        // ------------------ STEP 2 CONFIRM (save appointment) ------------------
        [HttpPost("step2/confirm")]
        public IActionResult ConfirmStep2([FromBody] BookingStep2ConfirmRequest model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.JobId) ||
                string.IsNullOrWhiteSpace(model.SelectedDate))
                return BadRequest(new { message = "Invalid confirmation data." });

            if (!DateTime.TryParse(model.SelectedDate, out var date))
                return BadRequest(new { message = "Invalid date format." });

            try
            {
                using (var conn = _db.GetConnection())
                {
                    conn.Open();

                    bool amTaken = false;
                    bool pmTaken = false;

                    using (var cmd = new SQLiteCommand(
                        @"SELECT TimeSlot FROM Appointments WHERE ScheduledDate = @Date;", conn))
                    {
                        cmd.Parameters.AddWithValue("@Date", date.ToString("yyyy-MM-dd"));
                        using (var r = cmd.ExecuteReader())
                        {
                            while (r.Read())
                            {
                                int slot = r.GetInt32(0);
                                if (slot == 1) amTaken = true;
                                else pmTaken = true;
                            }
                        }
                    }

                    int slotToBook =
                        !amTaken ? 1 :
                        !pmTaken ? 0 :
                        throw new Exception("Both slots full");

                    // INSERT appointment
                    using (var insert = new SQLiteCommand(
                        @"INSERT INTO Appointments (AppointmentID, JobID, ScheduledDate, TimeSlot)
                          VALUES (@AID, @JID, @Date, @Slot);", conn))
                    {
                        insert.Parameters.AddWithValue("@AID", Guid.NewGuid().ToString());
                        insert.Parameters.AddWithValue("@JID", model.JobId);
                        insert.Parameters.AddWithValue("@Date", date.ToString("yyyy-MM-dd"));
                        insert.Parameters.AddWithValue("@Slot", slotToBook);
                        insert.ExecuteNonQuery();
                    }

                    // UPDATE JOB STATUS
                    using (var update = new SQLiteCommand(
                        @"UPDATE Jobs SET Status='Booked' WHERE JobID=@JID;", conn))
                    {
                        update.Parameters.AddWithValue("@JID", model.JobId);
                        update.ExecuteNonQuery();
                    }

                    return Ok(new
                    {
                        message = "Booking confirmed.",
                        jobId = model.JobId,
                        selectedDate = date.ToString("yyyy-MM-dd"),
                        timeSlot = slotToBook == 1 ? "AM" : "PM"
                    });
                }
            }
            catch
            {
                return StatusCode(500, new { message = "Server error while confirming booking." });
            }
        }
    }
}
