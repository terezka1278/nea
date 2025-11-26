using System.Data;
using System.Data.SQLite;
using System.Linq;
using Dapper;
using Neaproject.Models;
using Neaproject.Dtos;

//TODO: NEED TO COMMENT FULL CODE
namespace Neaproject.Data
{
    public class SqliteDataAccess //class to allow communication with database
    {
        private readonly string _connString = "Data Source=database.db"; //connection string that points to the database file in the project directory

        //creates new connection to database using a connection string
        public SQLiteConnection GetConnection() 
        {
            return new SQLiteConnection(LoadConnectionString());
        }

        //builds full path to database file so that the app can find it
        private string LoadConnectionString()
        {
            var dbPath = Path.Combine(AppContext.BaseDirectory, "database.db");
            return $"Data Source={dbPath};Version=3;";
        }


        private IDbConnection CreateConnection()
        {
            return new SQLiteConnection(LoadConnectionString());
        }

        // LOGIN
        public User? GetUserByEmail(string email)
        {
            using (IDbConnection cnn = new SQLiteConnection(LoadConnectionString()))
            {
                var param = new { Email = email };
                var user = cnn.Query<User>(
                    @"SELECT
                          ClientID AS Id,
                          Email,
                          Password,
                          Role
                      FROM Clients
                      WHERE Email = @Email;",
                    param
                ).FirstOrDefault();

                return user;
            }
        }

        // CHECK IF EMAIL EXISTS
        public bool EmailExists(string email)
        {
            using (IDbConnection cnn = new SQLiteConnection(LoadConnectionString()))
            {
                int count = cnn.ExecuteScalar<int>(
                    "SELECT COUNT(1) FROM Clients WHERE Email = @Email;",
                    new { Email = email }
                );

                return count > 0;
            }
        }
        public bool PhoneExists(string phoneNum)
        {
            using (IDbConnection cnn = new SQLiteConnection(LoadConnectionString()))
            {
                const string sql = "SELECT 1 FROM Clients WHERE PhoneNum = @PhoneNum LIMIT 1;";
                var result = cnn.ExecuteScalar<int?>(sql, new { PhoneNum = phoneNum });
                return result != null;
            }
        }

        public void CreateClient(Client client)
        {
            using (IDbConnection cnn = new SQLiteConnection(LoadConnectionString()))
            {
                const string sql = @"
            INSERT INTO Clients
                (ClientID, FirstName, LastName, Email, PhoneNum, Address, Postcode, Password, Role)
            VALUES
                (@ClientID, @FirstName, @LastName, @Email, @PhoneNum, @Address, @Postcode, @Password, @Role);
        ";

                try
                {
                    cnn.Execute(sql, client);
                }
                catch (SQLiteException ex)
                {
                    if (ex.Message.Contains("PhoneNum"))
                    {
                        throw new Exception("Phone number already in use.");
                    }
                    if (ex.Message.Contains("Email"))
                    {
                        throw new Exception("Email already in use.");
                    }

                    throw; // for anything else
                }
            }
        
        }
        // ========== CLIENT BOOKINGS: ALL ==========
        public IEnumerable<ClientBooking> GetBookingsForClient(string clientId)
        {
            using (IDbConnection cnn = new SQLiteConnection(LoadConnectionString()))
            {
                var sql = @"
            SELECT 
                j.JobID,
                s.ServiceName AS ServiceName,
                a.ScheduledDate,
                a.TimeSlot AS TimeSlotPm,
                j.Status,
                q.EstPrice
            FROM Jobs j
            INNER JOIN Services s ON j.ServiceID = s.ServiceID
            INNER JOIN Appointments a ON j.JobID = a.JobID
            LEFT JOIN Quotes q ON j.JobID = q.JobID
            WHERE j.ClientID = @ClientId
            ORDER BY date(a.ScheduledDate) DESC;
        ";

                return cnn.Query<ClientBooking>(sql, new { ClientId = clientId });
            }
        }

        // ========== CLIENT DASHBOARD: NEXT UPCOMING ==========
        public NextBooking? GetNextBookingForClient(string clientId)
        {
            using (IDbConnection cnn = new SQLiteConnection(LoadConnectionString()))
            {
                var sql = @"
            SELECT 
                j.JobID,
                s.ServiceName AS ServiceName,
                a.ScheduledDate,
                a.TimeSlot AS TimeSlotPm,
                j.Status
            FROM Jobs j
            INNER JOIN Services s ON j.ServiceID = s.ServiceID
            INNER JOIN Appointments a ON j.JobID = a.JobID
            WHERE j.ClientID = @ClientId
              AND date(a.ScheduledDate) >= date('now')
              AND j.Status <> 'Completed'
            ORDER BY date(a.ScheduledDate) ASC
            LIMIT 1;
        ";

                var booking = cnn.QueryFirstOrDefault<NextBooking>(sql, new { ClientId = clientId });

                if (booking == null)
                {
                    return new NextBooking { HasBooking = false };
                }

                booking.HasBooking = true;
                return booking;
            }
        }
        // ========== CLIENT QUOTES ==========
        public IEnumerable<ClientQuote> GetQuotesForClient(string clientId)
        {
            using (IDbConnection cnn = new SQLiteConnection(LoadConnectionString()))
            {
                var sql = @"
            SELECT 
                q.QuoteID,
                j.JobID,
                s.ServiceName,
                q.EstPrice,
                q.EstDuration,
                q.Accepted
            FROM Quotes q
            INNER JOIN Jobs j ON q.JobID = j.JobID
            INNER JOIN Services s ON j.ServiceID = s.ServiceID
            WHERE j.ClientID = @ClientId
            ORDER BY q.QuoteID;
        ";

                return cnn.Query<ClientQuote>(sql, new { ClientId = clientId });
            }
        }

        // ========== CLIENT INVOICES ==========
        public IEnumerable<ClientInvoice> GetInvoicesForClient(string clientId)
        {
            using (IDbConnection cnn = new SQLiteConnection(LoadConnectionString()))
            {
                var sql = @"
            SELECT 
                i.InvoiceID,
                j.JobID,
                s.ServiceName,
                i.FinalPrice,
                i.PaymentStatus,
                i.DepositPaid
            FROM Invoices i
            INNER JOIN Jobs j ON i.JobID = j.JobID
            INNER JOIN Services s ON j.ServiceID = s.ServiceID
            WHERE j.ClientID = @ClientId
            ORDER BY i.InvoiceID;
        ";

                return cnn.Query<ClientInvoice>(sql, new { ClientId = clientId });
            }
        }

        public Client? GetClientById(string clientId)
        {
            using (IDbConnection cnn = new SQLiteConnection(LoadConnectionString()))
            {
                var sql = @"
            SELECT ClientID, FirstName, LastName, Email, PhoneNum, Address, Postcode, Password, Role
            FROM Clients
            WHERE ClientID = @ClientID;
        ";

                return cnn.QueryFirstOrDefault<Client>(sql, new { ClientID = clientId });
            }
        }
        public void UpdateClientFields(string clientId, string? email, string? phone, string? address, string? postcode, string? password)
        {
            using (IDbConnection cnn = new SQLiteConnection(LoadConnectionString()))
            {
                var sql = @"
            UPDATE Clients
            SET
                Email = COALESCE(@Email, Email),
                PhoneNum = COALESCE(@PhoneNum, PhoneNum),
                Address = COALESCE(@Address, Address),
                Postcode = COALESCE(@Postcode, Postcode),
                Password = COALESCE(@Password, Password)
            WHERE ClientID = @ClientID;
        ";

                cnn.Execute(sql, new
                {
                    ClientID = clientId,
                    Email = email,
                    PhoneNum = phone,
                    Address = address,
                    Postcode = postcode,
                    Password = password
                });
            }
        }
        public IEnumerable<Job> GetAllJobs()
        {
            using (IDbConnection cnn = new SQLiteConnection(LoadConnectionString()))
            {
                var sql = @"
            SELECT 
                j.JobID,
                c.FirstName || ' ' || c.LastName AS ClientName,
                a.ScheduledDate AS ScheduledDate,
                j.Status,
                s.ServiceName,      -- NEW
                c.Address,          -- NEW
                c.Postcode          -- NEW
            FROM Jobs j
            JOIN Clients c    ON j.ClientID  = c.ClientID
            JOIN Appointments a ON a.JobID   = j.JobID
            JOIN Services s   ON j.ServiceID = s.ServiceID
            ORDER BY a.ScheduledDate DESC;
        ";

                return cnn.Query<Job>(sql);
            }
        }

        // Mark job as completed
        public void MarkJobCompleted(string jobId)
        {
            using (IDbConnection cnn = new SQLiteConnection(LoadConnectionString()))
            {
                var sql = @"
                    UPDATE Jobs
                    SET 
                        Status = 'Completed',
                        DateFinished = COALESCE(DateFinished, DATE('now'))
                    WHERE JobID = @JobID;
                ";

                cnn.Execute(sql, new { JobID = jobId });
            }
        }
        // ALL QUOTES (for the business view)
        public IEnumerable<ClientQuote> GetAllQuotes()
        {
            using (IDbConnection cnn = new SQLiteConnection(LoadConnectionString()))
            {
                var sql = @"
            SELECT 
                q.QuoteID,
                j.JobID,
                s.ServiceName,
                q.EstPrice,
                q.EstDuration,
                q.Accepted
            FROM Quotes q
            INNER JOIN Jobs j ON q.JobID = j.JobID
            INNER JOIN Services s ON j.ServiceID = s.ServiceID
            ORDER BY q.QuoteID;
        ";

                return cnn.Query<ClientQuote>(sql);
            }
        }

        // ALL INVOICES (for the business view)
        public IEnumerable<ClientInvoice> GetAllInvoices()
        {
            using (IDbConnection cnn = new SQLiteConnection(LoadConnectionString()))
            {
                var sql = @"
            SELECT 
                i.InvoiceID,
                j.JobID,
                s.ServiceName,
                i.FinalPrice,
                i.PaymentStatus,
                i.DepositPaid
            FROM Invoices i
            INNER JOIN Jobs j ON i.JobID = j.JobID
            INNER JOIN Services s ON j.ServiceID = s.ServiceID
            ORDER BY i.InvoiceID;
        ";

                return cnn.Query<ClientInvoice>(sql);
            }
        }


    }

}



